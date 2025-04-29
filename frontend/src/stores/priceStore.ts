import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePriceStore = defineStore('prices', () => {
  const prices = ref<Record<string, number | null>>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const hasFetchedOnce = ref(false); // Track if initial fetch happened
  let fetchInterval: ReturnType<typeof setInterval> | null = null;

  async function fetchPrices() {
    // console.log('[PriceStore] Fetching prices...');
    isLoading.value = true;
    // error.value = null; // Optionally clear error on new fetch attempt
    try {
      const response = await fetch('/api/assets/prices');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      prices.value = data;
      hasFetchedOnce.value = true; // Mark initial fetch complete
      // console.log('[PriceStore] Prices updated:', prices.value);
    } catch (err: any) {
      console.error("[PriceStore] Error fetching prices:", err);
      error.value = "Failed to fetch latest prices."; // Provide a user-friendly error
    } finally {
      isLoading.value = false;
    }
  }

  function startPriceUpdates(intervalSeconds = 60) {
    if (fetchInterval) {
      console.log('[PriceStore] Price updates already running.');
      return;
    }
    console.log(`[PriceStore] Starting price updates every ${intervalSeconds} seconds.`);
    // Fetch immediately first time
    if (!hasFetchedOnce.value) {
        fetchPrices();
    }
    // Then set interval
    fetchInterval = setInterval(fetchPrices, intervalSeconds * 1000);
  }

  function stopPriceUpdates() {
    if (fetchInterval) {
      console.log('[PriceStore] Stopping price updates.');
      clearInterval(fetchInterval);
      fetchInterval = null;
    }
  }

  // Optionally clear prices on logout or when not needed
  function clearPrices() {
    prices.value = {};
    hasFetchedOnce.value = false;
    stopPriceUpdates();
  }

  return {
    prices,
    isLoading,
    error,
    hasFetchedOnce,
    fetchPrices,
    startPriceUpdates,
    stopPriceUpdates,
    clearPrices
  };
});
