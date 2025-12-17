<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import Header from '@/components/Header.vue'
import ConfigModal from '@/components/ConfigModal.vue'
import AlertBanner from '@/components/AlertBanner.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import InverterStatus from '@/components/InverterStatus.vue'
import FrequencyCard from '@/components/FrequencyCard.vue'
import Controls from '@/components/Controls.vue'
import FrequencySlider from '@/components/FrequencySlider.vue'
import SystemStats from '@/components/SystemStats.vue'
import EventLog from '@/components/EventLog.vue'

const { connect, disconnect, currentFreq, setpointFreq } = useWebSocket()
const showConfig = ref(false)

onMounted(() => {
  connect()
  
  // Reconecta ao voltar para a página
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
</script>

<template>
  <ToastContainer />
  <ConfigModal :isOpen="showConfig" @close="showConfig = false" />
  
  <Header @open-config="showConfig = true" />
  
  <main class="main">
    <AlertBanner />
    
    <section class="grid">
      <InverterStatus />
      
      <FrequencyCard 
        title="Frequência de Saída" 
        :value="currentFreq" 
        label="Saída Real"
      />
      
      <FrequencyCard 
        title="Frequência Programada" 
        :value="setpointFreq" 
        label="Setpoint"
      />
      
      <Controls />
      
      <FrequencySlider />
      
      <SystemStats />
      
      <EventLog />
    </section>
  </main>
  
  <footer>
    © 2024 JAMEK Solutions • Sistema v4.1 Node-RED Edition • Desenvolvido com ❤️
  </footer>
</template>

<style scoped>
.main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .main {
    padding: 12px;
  }
}
</style>
