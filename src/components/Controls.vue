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

.controls {
  display: grid;
  gap: 10px;
}

button {
  padding: 12px 18px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  transform: translate(-50%, -50%);
  transition: width 0.5s, height 0.5s;
}

button:active::before {
  width: 300px;
  height: 300px;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

button:active:not(:disabled) { 
  transform: scale(0.98); 
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-start { 
  background: var(--green);
  color: #fff;
}

.btn-start:hover:not(:disabled) {
  background: #16a34a;
}

.btn-stop  { 
  background: var(--red);
  color: #fff;
}

.btn-stop:hover:not(:disabled) {
  background: #dc2626;
}

.btn-dir   { 
  background: var(--primary);
  color: #fff;
}

.btn-dir:hover:not(:disabled) {
  background: #1d4ed8;
}
</style>
