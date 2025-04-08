<template>
    <div class="relative w-full h-full">
        <!-- Error display -->
        <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="text-red-400 text-sm flex flex-col items-center gap-2">
                <span>{{ error }}</span>
                <button @click="retryLoading" class="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs">
                    Retry
                </button>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="animate-spin w-6 h-6 border-2 border-green-400/20 border-t-green-400 rounded-full"></div>
        </div>

        <div class="absolute top-0 right-0 p-4 z-10 flex gap-2">
            <button v-for="period in timeframes" :key="period.value" @click="updateTimeframe(period.value)" :class="[
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                selectedTimeframe === period.value
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
            ]">
                {{ period.label }}
            </button>
        </div>
        <div class="absolute top-0 left-0 p-4 z-10 flex gap-2">
            <button v-for="indicator in indicators" :key="indicator.value" @click="toggleIndicator(indicator.value)"
                :class="[
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    activeIndicators.includes(indicator.value)
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                ]">
                {{ indicator.label }}
            </button>
        </div>

        <!-- Chart container -->
        <div ref="chartContainer" class="w-full h-full">
            <canvas ref="chartRef"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
    assetId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['chart-error'])

// Chart state
const chartRef = ref<HTMLCanvasElement | null>(null)
const chartContainer = ref<HTMLDivElement | null>(null)
const chart = ref<Chart | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const selectedTimeframe = ref('1D')
const activeIndicators = ref(['sma'])

// Time frames options
const timeframes = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' }
]

// Technical indicator options
const indicators = [
    { label: 'SMA', value: 'sma' },
    { label: 'EMA', value: 'ema' },
    { label: 'RSI', value: 'rsi' }
]

// Template data for price history - this way we don't need complex adapters
const templateData = {
    '1D': {
        timestamps: Array.from({ length: 24 }, (_, i) => {
            const date = new Date()
            date.setHours(date.getHours() - 24 + i)
            return date.toISOString()
        }),
        prices: Array.from({ length: 24 }, () => Math.random() * 1000 + 10000),
        volumes: Array.from({ length: 24 }, () => Math.random() * 1000000)
    },
    '1W': {
        timestamps: Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - 7 + i)
            return date.toISOString()
        }),
        prices: Array.from({ length: 7 }, () => Math.random() * 1000 + 10000),
        volumes: Array.from({ length: 7 }, () => Math.random() * 5000000)
    },
    '1M': {
        timestamps: Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - 30 + i)
            return date.toISOString()
        }),
        prices: Array.from({ length: 30 }, () => Math.random() * 1000 + 10000),
        volumes: Array.from({ length: 30 }, () => Math.random() * 10000000)
    }
}

const fetchPriceHistory = async () => {
    // Clear any existing chart first to prevent "Canvas already in use" errors
    if (chart.value) {
        chart.value.destroy();
        chart.value = null;
    }

    loading.value = true
    error.value = null

    try {
        // First get the asset symbol and type from our backend just to log it
        // This simulates a real backend call but we'll use our template data
        const assetResponse = await fetch(`http://localhost:3000/api/assets/${props.assetId}`)
        if (!assetResponse.ok) throw new Error('Failed to fetch asset details')
        const asset = await assetResponse.json()
        console.log(`Loading chart data for ${asset.symbol} (${asset.type})`)

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 500))

        // Use our template data instead of actual API call
        createChart(templateData[selectedTimeframe.value])

    } catch (err) {
        console.error('Chart error:', err)
        error.value = err instanceof Error ? err.message : 'Failed to load chart data'
        emit('chart-error', error.value)
    } finally {
        loading.value = false
    }
}

const retryLoading = () => {
    fetchPriceHistory()
}

const updateTimeframe = (timeframe: string) => {
    selectedTimeframe.value = timeframe
    fetchPriceHistory()
}

const createChart = (data: { timestamps: string[], prices: number[], volumes: number[] }) => {
    if (chart.value) {
        chart.value.destroy()
    }

    const ctx = chartRef.value?.getContext('2d')
    if (!ctx) return

    // Determine time unit based on selected timeframe
    const timeUnit = selectedTimeframe.value === '1D' ? 'hour' : selectedTimeframe.value === '1W' ? 'day' : 'week'

    const chartConfig = {
        type: 'line',
        data: {
            labels: data.timestamps,
            datasets: [{
                label: 'Price',
                data: data.prices,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            animation: {
                duration: 0 // Disable animations for better performance
            },
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: timeUnit,
                        displayFormats: {
                            hour: 'HH:mm',
                            day: 'MMM D',
                            week: 'MMM D',
                            month: 'MMM YYYY'
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        source: 'auto',
                        maxRotation: 0,
                        color: 'rgba(255,255,255,0.5)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.5)',
                        callback: (value) => `$${value.toLocaleString()}`
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'rgba(255,255,255,0.8)',
                    bodyColor: 'rgba(255,255,255,0.8)',
                    displayColors: false,
                    callbacks: {
                        label: (context) => `$${context.parsed.y.toLocaleString()}`,
                        title: (tooltipItems) => {
                            const item = tooltipItems[0]
                            const date = new Date(item.label)
                            return date.toLocaleString()
                        }
                    }
                }
            }
        }
    }

    // Add technical indicators
    addTechnicalIndicators(data.prices, chartConfig)

    chart.value = new Chart(ctx, chartConfig)
}

const addTechnicalIndicators = (prices: number[], chartConfig: any) => {
    const datasets = chartConfig.data.datasets

    // Add technical indicators if enabled
    console.log('Active indicators:', activeIndicators.value);

    // Create a local constant to avoid repeated .value access
    const activeInds = activeIndicators.value;

    if (activeInds.includes('sma')) {
        datasets.push({
            label: 'SMA 20',
            data: calculateSMA(prices, 20),
            borderColor: '#60a5fa',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
        })
    }

    if (activeInds.includes('ema')) {
        datasets.push({
            label: 'EMA 20',
            data: calculateEMA(prices, 20),
            borderColor: '#f472b6',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
        })
    }

    if (activeInds.includes('rsi')) {
        // Using a separate dataset for RSI would require a secondary y-axis
        // Simplified approach: simulate RSI by adding relative values
        datasets.push({
            label: 'RSI',
            data: calculateRSI(prices),
            borderColor: '#fbbf24',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            yAxisID: 'rsi'
        })

        // Add RSI y-axis
        chartConfig.options.scales.rsi = {
            position: 'right',
            grid: {
                drawOnChartArea: false
            },
            ticks: {
                color: 'rgba(255,255,255,0.5)'
            },
            min: 0,
            max: 100
        }
    }
}

// Simple moving average calculation
const calculateSMA = (data: number[], window: number) => {
    const result = []

    // Add null values for the initial period where SMA isn't calculated
    for (let i = 0; i < window - 1; i++) {
        result.push(null)
    }

    for (let i = window - 1; i < data.length; i++) {
        const windowData = data.slice(i - window + 1, i + 1)
        const avg = windowData.reduce((sum, val) => sum + val, 0) / window
        result.push(avg)
    }

    return result
}

// Exponential moving average calculation
const calculateEMA = (data: number[], window: number) => {
    const result = []

    // Add null values for the initial period
    for (let i = 0; i < window - 1; i++) {
        result.push(null)
    }

    // Start with SMA for the first value
    const firstWindow = data.slice(0, window)
    let currentEMA = firstWindow.reduce((sum, val) => sum + val, 0) / window
    result.push(currentEMA)

    // Calculate multiplier
    const multiplier = 2 / (window + 1)

    // Calculate EMA for the rest
    for (let i = window; i < data.length; i++) {
        currentEMA = (data[i] - currentEMA) * multiplier + currentEMA
        result.push(currentEMA)
    }

    return result
}

// Simplified RSI calculation
const calculateRSI = (data: number[]) => {
    const result = []
    const period = 14

    // Add null values for the initial period
    for (let i = 0; i < period; i++) {
        result.push(null)
    }

    for (let i = period; i < data.length; i++) {
        const gains = []
        const losses = []

        // Calculate gains and losses for the period
        for (let j = i - period + 1; j <= i; j++) {
            const change = data[j] - data[j - 1]
            if (change >= 0) {
                gains.push(change)
                losses.push(0)
            } else {
                gains.push(0)
                losses.push(Math.abs(change))
            }
        }

        const avgGain = gains.reduce((sum, val) => sum + val, 0) / period
        const avgLoss = losses.reduce((sum, val) => sum + val, 0) / period

        if (avgLoss === 0) {
            result.push(100)
        } else {
            const rs = avgGain / avgLoss
            const rsi = 100 - (100 / (1 + rs))
            result.push(rsi)
        }
    }

    return result
}

const toggleIndicator = (indicator: string) => {
    const index = activeIndicators.value.indexOf(indicator)
    if (index === -1) {
        activeIndicators.value.push(indicator)
    } else {
        activeIndicators.value.splice(index, 1)
    }
    fetchPriceHistory() // Recreate chart with new indicators
}

onMounted(() => {
    fetchPriceHistory()
})

// Make sure to clean up on component unmount
onUnmounted(() => {
    if (chart.value) {
        chart.value.destroy()
        chart.value = null
    }
})
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 100%;
}
</style>