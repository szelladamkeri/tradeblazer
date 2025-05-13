const fetch = require('node-fetch');
const db = require('../db/db_config.js'); // Imports { pool }

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Simple in-memory cache for prices { symbol: { price: number, timestamp: number } }
const priceCache = new Map();
const CACHE_DURATION_MS = 60 * 1000; // Cache prices for 1 minute

let isFetching = false; // Prevent concurrent fetches

async function updateAssetPriceInDb(symbol, price) {
    if (price === null || price === undefined) {
        // Optionally decide if you want to update the DB with NULL or skip
        // console.log(`[DB Update] Skipping DB update for ${symbol} due to null price.`);
        return; // Skip update if price is null
    }
    try {
        // Use callback style for consistency with other DB calls
        db.pool.query(
            'UPDATE assets SET price = ? WHERE symbol = ?',
            [price, symbol],
            (err, result) => {
                if (err) {
                    console.error(`[DB Update] Error updating price for ${symbol} in database:`, err);
                } else if (result.affectedRows > 0) {
                    // console.log(`[DB Update] Successfully updated price for ${symbol} in database.`);
                } else {
                    // console.warn(`[DB Update] No rows updated for symbol ${symbol}. It might not exist.`);
                }
            }
        );
    } catch (error) {
        // Catch potential synchronous errors, though unlikely with callback query
        console.error(`[DB Update] Synchronous error during DB update for ${symbol}:`, error);
    }
}

// Modify fetchQuote to accept type
async function fetchQuote(symbol, type) { // Added type parameter
    if (!FINNHUB_API_KEY) {
        console.error('FINNHUB_API_KEY is not set.');
        return null;
    }

    // --- Symbol Mapping Logic ---
    let finnhubSymbol = symbol;

    // Handle specific index symbols FIRST, regardless of reported type
    if (symbol === 'DJIA') finnhubSymbol = '^DJI';
    else if (symbol === 'SPX') finnhubSymbol = '^GSPC';
    else if (symbol === 'NASDAQ') finnhubSymbol = '^IXIC';
    else {
        // If not a specific index, proceed with type-based mapping
        switch (type?.toLowerCase()) {
            case 'crypto':
                // Corrected mapping: Remove the extra 'USD'
                const baseCurrency = symbol.replace('USD', ''); // Get base like BTC, ETH, ADA
                finnhubSymbol = `BINANCE:${baseCurrency}USDT`;
                break;
            case 'forex':
                // Keep existing Forex mapping (though it results in 403)
                finnhubSymbol = `OANDA:${symbol.replace('/', '_')}`;
                 if (!symbol.includes('/')) {
                     if (symbol.length === 6) {
                        finnhubSymbol = `OANDA:${symbol.substring(0,3)}_${symbol.substring(3,6)}`;
                     } else {
                         console.warn(`Unsupported forex symbol format for Finnhub: ${symbol}`);
                         return priceCache.get(symbol)?.price ?? null;
                     }
                }
                break;
            // Removed 'index' case as it's handled above
            case 'stock':
                // Handle delisted/changed stocks
                if (['WORK', 'ZNGA', 'TWTR'].includes(symbol)) {
                     console.warn(`Symbol '${symbol}' is likely delisted or changed. Skipping.`);
                     return priceCache.get(symbol)?.price ?? null;
                }
                // Default stock symbol is correct
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
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
        return cached.price;
    }

    console.log(`Fetching price for ${symbol} (using Finnhub symbol: ${finnhubSymbol})`); // Log the mapped symbol
    try {
        const url = `${FINNHUB_BASE_URL}/quote?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`;
        console.log(`[fetchQuote] Constructed URL for ${symbol}: ${url}`); // ADDED: Log the exact URL
        const response = await fetch(url);
        let fetchedPrice = null; // Variable to hold the price to be updated/cached

        if (!response.ok) {
            if (response.status === 429) {
                console.warn(`Rate limit likely hit for Finnhub API. Status: ${response.status}`);
            } else {
                // Log error only if it's not a 'no data' scenario for potentially bad symbols
                if (response.status !== 404) { // Assuming 404 might mean symbol not found
                   console.error(`Finnhub API error for ${symbol} (Finnhub: ${finnhubSymbol}): ${response.status} ${response.statusText}`);
                }
            }
            fetchedPrice = cached ? cached.price : null; // Use cached price on error
        } else {
            const data = await response.json();
            // Finnhub returns 'c' for current price
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

        // Cache the fetched price (or null)
        const timestamp = Date.now();
        priceCache.set(symbol, { price: fetchedPrice, timestamp });

        // Update the database with the fetched price (or null, depending on updateAssetPriceInDb logic)
        await updateAssetPriceInDb(symbol, fetchedPrice);

        return fetchedPrice;

    } catch (error) {
        console.error(`Error fetching quote for ${symbol} (Finnhub: ${finnhubSymbol}):`, error);
        // Update DB even on error? Maybe update with cached value if available?
        const errorPrice = cached ? cached.price : null;
        await updateAssetPriceInDb(symbol, errorPrice); // Update DB with cached price on error
        return errorPrice;
    }
}

async function fetchAndCacheAllAssetPrices() {
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
        const assetsToFetch = await new Promise((resolve, reject) => {
            db.pool.query('SELECT symbol, MAX(type) as type FROM assets GROUP BY symbol', (err, rows) => {
                if (err) {
                    console.error('[fetchAndCacheAllAssetPrices] Database query error:', err);
                    return reject(err);
                }
                console.log(`[fetchAndCacheAllAssetPrices] Found ${rows.length} unique assets in DB:`, rows); // Log assets found
                resolve(rows.map(row => ({ symbol: row.symbol, type: row.type })));
            });
        });

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

    } catch (error) {
        console.error('[fetchAndCacheAllAssetPrices] Error during fetch cycle:', error);
    } finally {
        isFetching = false;
        console.log('[fetchAndCacheAllAssetPrices] Fetch cycle ended.');
        // Log the current state of the cache after fetching
        console.log('[fetchAndCacheAllAssetPrices] Current priceCache state:', Object.fromEntries(priceCache));
    }
}

function getLatestPrices(symbols = []) {
    const results = {};
    console.log(`[getLatestPrices] Requested symbols: ${symbols.length > 0 ? symbols.join(', ') : 'All'}`); // Log requested symbols
    if (!symbols || symbols.length === 0) {
        // Return all cached prices if no specific symbols requested
        for (const [symbol, data] of priceCache.entries()) {
            results[symbol] = data.price;
        }
    } else {
        symbols.forEach(symbol => {
            const cached = priceCache.get(symbol);
            results[symbol] = cached ? cached.price : null; // Return null if not in cache
        });
    }
    console.log('[getLatestPrices] Returning prices:', results); // Log returned prices
    return results;
}

// Function to start the periodic fetching
let intervalId = null;
function startPeriodicFetching(intervalMinutes = 1) {
    if (intervalId) {
        console.log('Periodic fetching already running.');
        return;
    }
    if (!FINNHUB_API_KEY) {
        console.warn("FINNHUB_API_KEY not set. Periodic price fetching will not start.");
        return;
    }

    const intervalMillis = intervalMinutes * 60 * 1000;
    console.log(`Starting periodic price fetching every ${intervalMinutes} minute(s).`);
    
    // Fetch immediately first time
    fetchAndCacheAllAssetPrices(); 
    
    intervalId = setInterval(fetchAndCacheAllAssetPrices, intervalMillis);
}

function stopPeriodicFetching() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Stopped periodic price fetching.');
    }
}

module.exports = {
    fetchQuote, // Exporting this might be useful for individual price checks elsewhere
    getLatestPrices,
    startPeriodicFetching,
    stopPeriodicFetching,
    // Expose cache for potential debugging or direct access if needed (use with caution)
    // priceCache 
};
