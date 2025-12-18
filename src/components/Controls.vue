<script setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { sendCommand, isConnected } = useWebSocket()

const startInv = () => {
  if (sendCommand("start")) {
    // Log handled in sendCommand/handleMessage or we can add local log here
  }
}

const stopInv = () => {
  sendCommand("stop")
}

const dirInv = () => {
  sendCommand("direcao")
}
</script>

<template>
  <div class="card">
    <h3>Comandos</h3>
    <div class="controls">
      <button class="btn-start" @click="startInv" :disabled="!isConnected">
        Ligar Inversor
      </button>
      <button class="btn-stop" @click="stopInv" :disabled="!isConnected">
        Desligar Inversor
      </button>
      <button class="btn-dir" @click="dirInv" :disabled="!isConnected">
        Inverter Direção
      </button>
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

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
}

button {
  padding: var(--space-4) var(--space-6);
  min-height: 56px; /* Fitts's Law: Large touch target */
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

/* Button Variants */
.btn-start {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
  border: 1px solid var(--success);
}

.btn-start:hover:not(:disabled) {
  background: var(--success);
  color: #000;
  box-shadow: 0 0 12px var(--success-light);
}

.btn-stop {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-stop:hover:not(:disabled) {
  background: var(--danger);
  color: #fff;
  box-shadow: 0 0 12px var(--danger-light);
}

.btn-dir {
  background: var(--surface-hover);
  color: var(--text-main);
  border: 1px solid var(--border);
}

.btn-dir:hover:not(:disabled) {
  background: var(--surface-active);
  border-color: var(--text-muted);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

.btn-stop {
  background: var(--danger-light);
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-stop:hover:not(:disabled) {
  background: var(--danger);
  color: #fff;
}

.btn-dir {
  background: var(--surface-hover);
  color: var(--text-main);
  border-color: var(--border);
}

.btn-dir:hover:not(:disabled) {
  background: var(--surface-active);
  border-color: var(--text-muted);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

/* Touch Feedback */
button:active {
  transform: scale(0.98);
}
</style>
