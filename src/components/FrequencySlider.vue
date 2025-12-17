<script setup>
import { ref, watch } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { setpointFreq, sendCommand, isConnected } = useWebSocket()

const localValue = ref(0)
let timer = null

// Update local value when prop changes, but only if not dragging (handled by UI logic typically, 
// but here we can just update if difference is significant or simply watch)
// To avoid jumping while dragging, we might want to separate "display value" from "actual setpoint"
watch(setpointFreq, (newVal) => {
  // Only update if we're not actively dragging (simple heuristic: if we just sent a command, we know)
  // For now, let's just update. The user experience might be slightly jumpy if bidirectional sync is fast.
  // In the original code: 
  // if (!document.getElementById("freqSlider").matches(':active')) { ... }
  // We can try to replicate this behavior or just bind one-way with event.
  
  // Since we can't easily check :active state in reactive flow without refs to element,
  // we will trust the v-model unless we want to implement the check.
  // Let's implement a simple debounce for sending, but immediate update for receiving unless interaction.
  localValue.value = newVal
})

const onInput = (event) => {
  const val = Number(event.target.value)
  localValue.value = val
  
  if (timer) clearTimeout(timer)
  
  timer = setTimeout(() => {
    if (sendCommand("freq", val)) {
      // Log handled in composable or we can add specific log here if needed
      // addLog(`Frequência: ${val} Hz`, "info") // The original code logged this
    }
  }, 800)
}
</script>

<template>
  <div class="card">
    <h3>Ajuste de Frequência</h3>
    <div class="slider">
      <div class="slider-display">
        <span class="slider-label">Setpoint</span>
        <div class="slider-value">
          <span>{{ localValue }}</span> Hz
        </div>
      </div>
      <input 
        type="range" 
        min="0" 
        max="60" 
        v-model="localValue"
        @input="onInput"
        :disabled="!isConnected"
      >
      <div class="slider-limits">
        <span>0 Hz</span>
        <span>60 Hz</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.card:hover {
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.card h3 {
  margin: 0 0 12px 0;
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
}

.slider {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  background: var(--border);
  border-radius: 10px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

input[type="range"]:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.3);
}

.slider-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-label {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slider-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.slider-limits {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
}
</style>
