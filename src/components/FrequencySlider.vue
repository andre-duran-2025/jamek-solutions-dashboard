<script setup>
import { ref, watch } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { setpointFreq, sendCommand, isConnected } = useWebSocket()

const localValue = ref(0)
const isDragging = ref(false)
let timer = null

// Update local value when prop changes, but only if not dragging
watch(setpointFreq, (newVal) => {
  if (!isDragging.value) {
    localValue.value = newVal
  }
})

const onDragStart = () => {
  isDragging.value = true
}

const onDragEnd = () => {
  isDragging.value = false
  // Ensure final value is sent immediately on release
  if (timer) clearTimeout(timer)
  sendCommand("freq", localValue.value)
}

const onInput = (event) => {
  const val = Number(event.target.value)
  localValue.value = val
  
  if (timer) clearTimeout(timer)
  
  // Debounce while dragging
  timer = setTimeout(() => {
    sendCommand("freq", val)
  }, 300) // Reduced from 800ms to 300ms for better responsiveness
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
        @mousedown="onDragStart"
        @mouseup="onDragEnd"
        @touchstart="onDragStart"
        @touchend="onDragEnd"
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
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.card:hover {
  border-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card h3 {
  margin: 0 0 var(--space-4) 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.slider {
  padding: var(--space-2) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

input[type="range"] {
  width: 100%;
  height: 8px; /* Increased for better visibility */
  background: var(--surface-active);
  border-radius: var(--radius-md);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

input[type="range"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px; /* Fitts's Law: Larger touch target */
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  transition: var(--transition);
  margin-top: -10px; /* Center thumb on track (28 - 8) / 2 = 10 */
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  background: var(--surface-active);
  border-radius: var(--radius-md);
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  transition: var(--transition);
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
}

.slider-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.slider-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  font-family: 'Inter', monospace;
}

.slider-limits {
  display: flex;
  justify-content: space-between;
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
