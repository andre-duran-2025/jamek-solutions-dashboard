<script setup>
import { ref } from 'vue'
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
    <ConfigModal :isOpen="showConfig" @close="showConfig = false" />
    
    <main class="main-content">
      <div class="container">
        <AlertBanner />
        
        <div class="dashboard-grid">
          <!-- Top Row: Status & Metrics -->
          <div class="status-section">
            <InverterStatus />
          </div>
          
          <div class="metrics-section">
            <FrequencyCard 
              title="Frequência Real" 
              :value="currentFreq" 
              variant="primary"
            />
            <FrequencyCard 
              title="Setpoint" 
              :value="setpointFreq" 
              variant="secondary"
            />
          </div>
          
          <!-- Middle: Controls -->
          <div class="controls-section">
            <Controls />
          </div>
          
          <!-- Bottom: Slider & Logs -->
          <div class="slider-section">
            <FrequencySlider />
          </div>
          
          <div class="info-section">
            <SystemStats />
            <EventLog />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.inverter-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.main-content {
  flex: 1;
  padding: 32px 24px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metrics-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .metrics-section,
  .info-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .dashboard-grid {
    gap: 16px;
  }
}
</style>
