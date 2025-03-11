import { onMounted, onUnmounted } from 'vue'

export function useWindowHeight() {
  const setAppHeight = () => {
    const doc = document.documentElement
    const height = window.innerHeight
    doc.style.setProperty('--app-height', `${height}px`)
  }

  onMounted(() => {
    setAppHeight()
    window.addEventListener('resize', setAppHeight)
    
    // Handle mobile browser chrome appearance/disappearance
    window.addEventListener('orientationchange', () => {
      setTimeout(setAppHeight, 100)
    })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', setAppHeight)
    window.removeEventListener('orientationchange', setAppHeight)
  })
}
