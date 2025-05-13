import fetch from 'node-fetch';
import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
// No API key needed for Hexarate
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const HEXARATE_BASE_URL = 'https://hexarate.paikama.co/api/rates/latest';

// Simple in-memory cache for prices { symbol: { price: number, timestamp: number } }
const priceCache = new Map<string, { price: number | null; timestamp: number }>();
const CACHE_DURATION_MS = 60 * 1000; // Cache prices for 1 minute

let isFetching = false; // Prevent concurrent fetches

async function updateAssetPriceInDb(symbol: string, price: number | null): Promise<void> {
    if (price === null || price === undefined) {
        // Optionally decide if you want to update the DB with NULL or skip
        // console.log(`[DB Update] Skipping DB update for ${symbol} due to null price.`);
        return; // Skip update if price is null
    }
    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE assets SET price = ? WHERE symbol = ?',
            [price, symbol]
        );
        if (result.affectedRows > 0) {
            // console.log(`[DB Update] Successfully updated price for ${symbol} in database.`);
        } else {
            // console.warn(`[DB Update] No rows updated for symbol ${symbol}. It might not exist.`);
        }
    } catch (error: any) {
        console.error(`[DB Update] Error updating price for ${symbol} in database:`, error);
    }
}

// Modify fetchQuote to accept type
async function fetchQuote(symbol: string, type: string): Promise<number | null> {
    if (!FINNHUB_API_KEY) {
        console.error('FINNHUB_API_KEY is not set.');
        return null;
    }
    // No API key check needed for Hexarate

    // --- Symbol Mapping Logic ---
    let finnhubSymbol = symbol;
    let hexarateBase = '';
    let hexarateTarget = '';

    // Handle specific index symbols FIRST, regardless of reported type
    if (symbol === 'DJIA') finnhubSymbol = '^DJI';
    else if (symbol === 'SPX') finnhubSymbol = '^GSPC';
    else if (symbol === 'NASDAQ') finnhubSymbol = '^IXIC';
    else {
        // If not a specific index, proceed with type-based mapping
        switch (type?.toLowerCase()) {
            case 'crypto':
                const baseCurrency = symbol.replace('USD', ''); // Get base like BTC, ETH, ADA
                finnhubSymbol = `BINANCE:${baseCurrency}USDT`;
                break;
            case 'forex':
                finnhubSymbol = `OANDA:${symbol.replace('/', '_')}`;
                if (!symbol.includes('/')) {
                    if (symbol.length === 6) {
                        finnhubSymbol = `OANDA:${symbol.substring(0, 3)}_${symbol.substring(3, 6)}`;
                        hexarateBase = symbol.substring(0, 3);
                        hexarateTarget = symbol.substring(3, 6);
                    } else {
                        console.warn(`Unsupported forex symbol format for Finnhub: ${symbol}`);
                        return priceCache.get(symbol)?.price ?? null;
                    }
                } else {
                    const parts = symbol.split('/');
                    hexarateBase = parts[0];
                    hexarateTarget = parts[1];
                }
                break;
            case 'stock':
                if (['WORK', 'ZNGA', 'TWTR'].includes(symbol)) {
                    console.warn(`Symbol '${symbol}' is likely delisted or changed. Skipping.`);
                    return priceCache.get(symbol)?.price ?? null;
                }
                finnhubSymbol = symbol;
                break;
            default:
                // Default to the symbol itself if type is unknown/missing
                finnhubSymbol = symbol;
                break;
        }
    }
    // --- End Symbol Mapping ---

    // Check cache first (using original symbol as key)
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.price;
    }

    console.log(`Fetching price for ${symbol} (using Finnhub symbol: ${finnhubSymbol})`); // Log the mapped symbol
    try {
        let url = `${FINNHUB_BASE_URL}/quote?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`;
        let useHexarate = type?.toLowerCase() === 'forex';
        if (useHexarate) {
            // Using Hexarate API format - no API key needed!
            url = `${HEXARATE_BASE_URL}/${hexarateBase}?target=${hexarateTarget}`;
            console.log(`Using Hexarate for ${hexarateBase} to ${hexarateTarget}`);
        }
        console.log(`[fetchQuote] Constructed URL for ${symbol}: ${url}`); // ADDED: Log the exact URL
        const response = await fetch(url);
        let fetchedPrice: number | null = null; // Variable to hold the price to be updated/cached

        if (!response.ok) {
            if (response.status === 429) {
                console.warn(`Rate limit likely hit for ${useHexarate ? 'Hexarate' : 'Finnhub'} API. Status: ${response.status}`);
            } else {
                // Log error only if it's not a 'no data' scenario for potentially bad symbols
                if (response.status !== 404) { // Assuming 404 might mean symbol not found
                    console.error(`${useHexarate ? 'Hexarate' : 'Finnhub'} API error for ${symbol} (${useHexarate ? 'Hexarate' : 'Finnhub'}: ${symbol}): ${response.status} ${response.statusText}`);
                }
            }
            fetchedPrice = cached ? cached.price : null; // Use cached price on error
        } else {
            const data = await response.json();
            if (useHexarate) {
                // Hexarate response handling
                if (data && data.status_code === 200 && data.data && data.data.mid) {
                    fetchedPrice = data.data.mid;
                } else {
                    console.warn(`No valid forex price data found for symbol: ${symbol} (Hexarate: ${hexarateBase}/${hexarateTarget})`, data);
                    fetchedPrice = null;
                }
            } else {
                // Finnhub response handling
                if (data && typeof data.c === 'number' && data.c !== 0) { // Check if price is not 0
                    fetchedPrice = data.c;
                } else {
                    // Don't log warning if price is 0, as Finnhub might return 0 for various reasons (market closed, no data)
                    // Only log if data structure is unexpected
                    if (!(data && typeof data.c === 'number')) {
                        console.warn(`No valid current price ('c') found for symbol: ${symbol} (Finnhub: ${finnhubSymbol})`, data);
                    }
                    fetchedPrice = null; // Set to null if price is 0 or invalid
                }
            }
        }

        // Cache the fetched price (or null)
        const timestamp = Date.now();
        priceCache.set(symbol, { price: fetchedPrice, timestamp });

        // Update the database with the fetched price (or null, depending on updateAssetPriceInDb logic)
        await updateAssetPriceInDb(symbol, fetchedPrice);

        return fetchedPrice;

    } catch (error: any) {
        console.error(`Error fetching quote for ${symbol} (${type?.toLowerCase() === 'forex' ? 'Hexarate' : 'Finnhub'}: ${symbol}):`, error);
        // Update DB even on error? Maybe update with cached value if available?
        const errorPrice = cached ? cached.price : null;
        await updateAssetPriceInDb(symbol, errorPrice); // Update DB with cached price on error
        return errorPrice;
    }
}

async function fetchAndCacheAllAssetPrices(): Promise<void> {
    if (isFetching) {
        console.log('[fetchAndCacheAllAssetPrices] Fetch already in progress. Skipping.');
        return;
    }
    if (!FINNHUB_API_KEY) {
        console.error('[fetchAndCacheAllAssetPrices] Cannot fetch prices: FINNHUB_API_KEY is not set.');
        return;
    }

    console.log('[fetchAndCacheAllAssetPrices] Starting fetch cycle.');
    isFetching = true;

    try {
        // 1. Get all unique symbols AND types from the database
        const [assetsToFetch] = await pool.query<RowDataPacket[]>('SELECT symbol, MAX(type) as type FROM assets GROUP BY symbol');
        console.log(`[fetchAndCacheAllAssetPrices] Found ${assetsToFetch.length} unique assets in DB:`, assetsToFetch); // Log assets found

        if (!assetsToFetch || assetsToFetch.length === 0) {
            console.log('[fetchAndCacheAllAssetPrices] No symbols found in the database to fetch prices for.');
            isFetching = false;
            return;
        }

        // 2. Fetch quote for each asset (sequentially)
        const delayBetweenRequests = assetsToFetch.length > 50 ? 1200 : 1000;
        console.log(`[fetchAndCacheAllAssetPrices] Using delay: ${delayBetweenRequests}ms`);

        let fetchedCount = 0;
        for (const asset of assetsToFetch) {
            console.log(`[fetchAndCacheAllAssetPrices] Processing asset: ${asset.symbol} (Type: ${asset.type})`);
            const price = await fetchQuote(asset.symbol, asset.type);
            console.log(`[fetchAndCacheAllAssetPrices] Fetched price for ${asset.symbol}: ${price}`); // Log fetched price
            fetchedCount++;
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }
        console.log(`[fetchAndCacheAllAssetPrices] Finished fetching ${fetchedCount} prices.`);

    } catch (error: any) {
        console.error('[fetchAndCacheAllAssetPrices] Error during fetch cycle:', error);
    } finally {
        isFetching = false;
        console.log('[fetchAndCacheAllAssetPrices] Fetch cycle ended.');
        // Log the current state of the cache after fetching
        console.log('[fetchAndCacheAllAssetPrices] Current priceCache state:', Object.fromEntries(priceCache));
    }
}

function getLatestPrices(symbols: string[] = []): { [symbol: string]: number | null } {
    const result: { [symbol: string]: number | null } = {};
    if (symbols.length === 0) {
        for (const [symbol, data] of priceCache) {
            if (Date.now() - data.timestamp < CACHE_DURATION_MS) {
                result[symbol] = data.price;
            }
        }
    } else {
        for (const symbol of symbols) {
            const data = priceCache.get(symbol);
            if (data && Date.now() - data.timestamp < CACHE_DURATION_MS) {
                result[symbol] = data.price;
            } else {
                result[symbol] = null;
            }
        }
    }
    return result;
}

let intervalId: NodeJS.Timeout | null = null;

function startPeriodicFetching(intervalMinutes = 1): void {
    if (intervalId) {
        console.log('[startPeriodicFetching] Periodic fetching already running.');
        return;
    }
    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(`[startPeriodicFetching] Starting periodic fetching every ${intervalMinutes} minute(s).`);
    fetchAndCacheAllAssetPrices().catch(err => {
        console.error('[startPeriodicFetching] Error in initial fetch:', err);
    });
    intervalId = setInterval(() => {
        fetchAndCacheAllAssetPrices().catch(err => {
            console.error('[startPeriodicFetching] Error in periodic fetch:', err);
        });
    }, intervalMs);
}

function stopPeriodicFetching(): void {
    if (intervalId) {
        console.log('[stopPeriodicFetching] Stopping periodic fetching.');
        clearInterval(intervalId);
        intervalId = null;
    } else {
        console.log('[stopPeriodicFetching] No periodic fetching to stop.');
    }
}

export { fetchQuote, fetchAndCacheAllAssetPrices, getLatestPrices, startPeriodicFetching, stopPeriodicFetching };