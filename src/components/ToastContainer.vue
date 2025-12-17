<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast" 
        :class="toast.type"
      >
        <div class="toast-indicator"></div>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
}

.toast-indicator {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.toast.success .toast-indicator { background: var(--green); }
.toast.error .toast-indicator { background: var(--red); }
.toast.warning .toast-indicator { background: var(--yellow); }
.toast.info .toast-indicator { background: var(--primary); }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
