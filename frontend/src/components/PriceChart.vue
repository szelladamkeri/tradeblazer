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

        <!-- Move controls to top container with proper spacing -->
        <div class="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between">
            <div class="flex gap-2">
                <!-- TimeFrames -->
                <button v-for="period in timeframes" :key="period.value" @click="updateTimeframe(period.value)" :class="[
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    selectedTimeframe === period.value
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                ]">
                    {{ period.label }}
                </button>
            </div>
        </div>

        <!-- Add time range slider for 1Y view -->
        <div v-if="selectedTimeframe === '1Y'" class="absolute top-16 left-0 right-0 px-4 z-10">
            <input type="range" v-model="timeRange" min="30" :max="365" step="30"
                class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" @input="handleTimeRangeChange">
            <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>{{ timeRange }} days</span>
                <span>1Y</span>
            </div>
        </div>

        <!-- Chart container with adjusted padding when slider is visible -->
        <div ref="chartContainer" class="w-full h-full"
            :class="{ 'pt-28': selectedTimeframe === '1Y', 'pt-16': selectedTimeframe !== '1Y' }">
            <canvas ref="chartRef" :id="chartId"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'
import type { ChartConfiguration, TooltipItem } from 'chart.js'
import 'chartjs-adapter-date-fns'

const props = defineProps({
    assetId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['chart-error'])

// Generate unique ID for the chart canvas
const chartId = `chart-${Math.random().toString(36).substr(2, 9)}`

// Chart state
const chartRef = ref<HTMLCanvasElement | null>(null)
const chartContainer = ref<HTMLDivElement | null>(null)
const chart = ref<Chart | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const selectedTimeframe = ref('1D')

// Time frames options
const timeframes = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '1Y', value: '1Y' }
] as const

type TimeFrame = typeof timeframes[number]['value']
type TemplateDataType = {
    [K in TimeFrame]: {
        timestamps: string[];
        prices: number[];
        volumes: number[];
    }
}

// Template data for price history - this way we don't need complex adapters
const templateData: TemplateDataType = {
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
    },
    '1Y': {
        timestamps: Array.from({ length: 365 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - 365 + i)
            return date.toISOString()
        }),
        prices: Array.from({ length: 365 }, () => Math.random() * 1000 + 10000),
        volumes: Array.from({ length: 365 }, () => Math.random() * 20000000)
    }
}

// Add price data cache
const priceDataCache = ref<{
    [key: string]: {
        timestamps: Date[],
        prices: number[],
        volumes: number[]
    }
}>({})

const fetchPriceHistory = async () => {
    // Return cached data if available
    if (priceDataCache.value[selectedTimeframe.value]) {
        createChart(priceDataCache.value[selectedTimeframe.value])
        return
    }

    destroyChart()
    loading.value = true
    error.value = null

    try {
        const assetResponse = await fetch(`http://localhost:3000/api/assets/${props.assetId}`)
        if (!assetResponse.ok) throw new Error('Failed to fetch asset details')
        const asset = await assetResponse.json()

        // Get the template data and convert timestamps to Date objects
        const data = templateData[selectedTimeframe.value as TimeFrame]
        const processedData = {
            timestamps: data.timestamps.map((ts: string) => new Date(ts)),
            prices: data.prices,
            volumes: data.volumes
        }

        // Cache the processed data
        priceDataCache.value[selectedTimeframe.value] = processedData

        // Create chart with processed data
        createChart(processedData)
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

// Add time range state
const timeRange = ref(365)

// Add time range handler
const handleTimeRangeChange = () => {
    if (selectedTimeframe.value === '1Y') {
        const data = templateData['1Y']
        const startIndex = data.timestamps.length - timeRange.value
        const processedData = {
            timestamps: data.timestamps.slice(startIndex).map(ts => new Date(ts)),
            prices: data.prices.slice(startIndex),
            volumes: data.volumes.slice(startIndex)
        }
        createChart(processedData)
    }
}

// Modify updateTimeframe to reset timeRange
const updateTimeframe = (timeframe: TimeFrame) => {
    selectedTimeframe.value = timeframe
    if (timeframe === '1Y') {
        timeRange.value = 365
    }
    destroyChart()
    fetchPriceHistory()
}

const createChart = (data: { timestamps: Date[], prices: number[], volumes: number[] }) => {
    if (!data) return
    destroyChart()

    const ctx = chartRef.value?.getContext('2d')
    if (!ctx) return

    const timeUnit = selectedTimeframe.value === '1D' ? 'hour' : 'day'

    const chartConfig: ChartConfiguration = {
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
                            day: 'MMM d',
                            week: 'MMM d',
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false,
                        color: 'transparent'
                    },
                    ticks: {
                        source: 'auto',
                        maxRotation: 0,
                        color: 'rgba(255,255,255,0.5)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.5)',
                        callback: function(value: string | number) {
                            if (typeof value === 'number') {
                                return `$${value.toLocaleString()}`
                            }
                            return value
                        }
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
                        label: (context: TooltipItem<'line'>) => `$${context.parsed.y.toLocaleString()}`,
                        title: (tooltipItems: TooltipItem<'line'>[]) => {
                            const date = tooltipItems[0].parsed.x
                            return new Date(date).toLocaleString()
                        }
                    }
                }
            }
        }
    }

    chart.value = new Chart(ctx, chartConfig)
}

const destroyChart = () => {
    if (chart.value) {
        chart.value.destroy()
        chart.value = null
    }
}

onMounted(() => {
    fetchPriceHistory()
})

// Make sure to clean up on component unmount
onUnmounted(() => {
    destroyChart()
})
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 100%;
}

/* Add custom slider styling */
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #4ade80;
    cursor: pointer;
    margin-top: -6px;
}

input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
}

input[type="range"]:focus {
    outline: none;
}
</style>