<script setup>
import { SpeedInsights } from "@vercel/speed-insights/vue"
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import Header from '@/components/Header.vue'
import ConfigModal from '@/components/ConfigModal.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import DashboardView from '@/views/DashboardView.vue'
import InverterView from '@/views/InverterView.vue'

const { connect, disconnect, activeInverterId } = useWebSocket()
const showConfig = ref(false)
const currentView = ref('dashboard') // dashboard | inverter

const headerTitle = computed(() => {
  return currentView.value === 'inverter' 
    ? `Inversor ${String(activeInverterId.value).padStart(2, '0')}`
    : 'JAMEK'
})

onMounted(() => {
  connect()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  disconnect()
})

const handleVisibilityChange = () => {
  if (!document.hidden) {
    connect()
  }
}

const handleBeforeUnload = () => {
  disconnect()
}

const navigateToInverter = (id) => {
  currentView.value = 'inverter'
  window.scrollTo(0, 0)
}

const navigateToDashboard = () => {
  currentView.value = 'dashboard'
  window.scrollTo(0, 0)
}
</script>

<template>
  <SpeedInsights />
  <ToastContainer />
  <ConfigModal :isOpen="showConfig" @close="showConfig = false" />
  
  <Header 
    :view="currentView" 
    :title="headerTitle"
    @open-config="showConfig = true" 
    @navigate="navigateToDashboard"
  />
  
  <div class="content-wrapper">
    <transition name="fade" mode="out-in">
      <DashboardView 
        v-if="currentView === 'dashboard'" 
        @select="navigateToInverter" 
      />
      <InverterView 
        v-else 
        @open-config="showConfig = true"
      />
    </transition>
  </div>
  
  <footer>
    © 2024 JAMEK Solutions • Sistema v4.1 Node-RED Edition • Desenvolvido com ❤️
  </footer>
</template>

<style scoped>
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

footer {
  padding: 12px 20px;
  text-align: center;
  font-size: 10px;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
