import { ref } from 'vue'

const currentView = ref('dashboard')

export function useNavigation() {
  const navigateTo = (view) => {
    currentView.value = view
  }
  
  return {
    currentView,
    navigateTo
  }
}
