<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import Header from '@/components/Header.vue'
import ConfigModal from '@/components/ConfigModal.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import DashboardView from '@/views/DashboardView.vue'
import InverterView from '@/views/InverterView.vue'

const { connect, disconnect } = useWebSocket()
const showConfig = ref(false)
const currentView = ref('dashboard') // dashboard | inverter

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
  <ToastContainer />
  <ConfigModal :isOpen="showConfig" @close="showConfig = false" />
  
  <Header @open-config="showConfig = true" />
  
  <div class="content-wrapper">
    <transition name="fade" mode="out-in">
      <DashboardView 
        v-if="currentView === 'dashboard'" 
        @select="navigateToInverter" 
      />
      <InverterView 
        v-else 
        @back="navigateToDashboard" 
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
  color: var(--muted);
  border-top: 1px solid var(--border);
  background: rgba(18, 26, 47, 0.8);
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
