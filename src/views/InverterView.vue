<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import ConfigModal from '@/components/ConfigModal.vue'
import AlertBanner from '@/components/AlertBanner.vue'
import InverterStatus from '@/components/InverterStatus.vue'
import FrequencyCard from '@/components/FrequencyCard.vue'
import Controls from '@/components/Controls.vue'
import FrequencySlider from '@/components/FrequencySlider.vue'
import SystemStats from '@/components/SystemStats.vue'
import EventLog from '@/components/EventLog.vue'

const { activeInverterId, currentFreq, setpointFreq } = useWebSocket()
const showConfig = ref(false)

const emit = defineEmits(['back', 'open-config'])
</script>

<template>
  <div class="inverter-view">
    <div class="nav-header">
      <button class="btn-back" @click="emit('back')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Voltar
      </button>
      <h2>Inversor {{ String(activeInverterId).padStart(2, '0') }}</h2>
    </div>

    <ConfigModal :isOpen="showConfig" @close="showConfig = false" />
    
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
  </div>
</template>

<style scoped>
.inverter-view {
  animation: slideIn 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: rgba(18, 26, 47, 0.8);
  border-bottom: 1px solid var(--border);
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.btn-back {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255,255,255,0.05);
  border-color: var(--primary);
}

.nav-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.main {
  flex: 1;
  padding: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 768px) {
  .nav-header {
    padding: 12px 16px;
  }
  
  .main {
    padding: 16px;
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
