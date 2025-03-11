import { ref, onMounted, onUnmounted } from 'vue'
import { handleApiError } from '@/utils/errorHandler'

export function useApiHeartbeat() {
  const isApiAvailable = ref(true)
  const apiError = ref<{ message: string; type: string } | null>(null)
  let heartbeatInterval: number | undefined
  
  const checkApiHeartbeat = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Short timeout to quickly detect problems
        signal: AbortSignal.timeout(3000)
      })
      
      if (!response.ok) {
        throw new Error('API server is not responding properly')
      }
      
      const data = await response.json()
      
      if (data.status !== 'ok') {
        throw new Error('API server reported unhealthy status')
      }
      
      isApiAvailable.value = true
      apiError.value = null
    } catch (err) {
      console.error('API heartbeat error:', err)
      isApiAvailable.value = false
      apiError.value = {
        message: 'Unable to connect to the server. Please check if the server is running.',
        type: 'connection'
      }
    }
  }
  
  onMounted(() => {
    // Check immediately on component mount
    checkApiHeartbeat()
    
    // Then check every 30 seconds
    heartbeatInterval = window.setInterval(checkApiHeartbeat, 30000) as unknown as number
  })
  
  onUnmounted(() => {
    // Clean up the interval when the component is unmounted
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
    }
  })
  
  return {
    isApiAvailable,
    apiError,
    checkApiHeartbeat
  }
}
