export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN)
      continue
    }
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // Start with SMA for first EMA value
  const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  ema.push(firstSMA)

  for (let i = 1; i < prices.length; i++) {
    const value = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
    ema.push(value)
  }

  return ema
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(Math.max(0, change))
    losses.push(Math.max(0, -change))
  }

  // Calculate RSI
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(NaN)
      continue
    }

    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period

    if (avgLoss === 0) {
      rsi.push(100)
    } else {
      const rs = avgGain / avgLoss
      rsi.push(100 - (100 / (1 + rs)))
    }
  }

  return rsi
}
