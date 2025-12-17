import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const showToast = (message, type = 'info') => {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    showToast,
    removeToast
  }
}
