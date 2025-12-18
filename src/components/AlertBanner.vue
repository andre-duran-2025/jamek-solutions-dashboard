<script setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { alertMessage, alertType, showAlertBanner } = useWebSocket()
</script>

<template>
  <transition name="slide-down">
    <div v-if="showAlertBanner" class="alert-banner" :class="alertType">
      <span class="icon">!</span>
      <span class="message">{{ alertMessage }}</span>
    </div>
  </transition>
</template>

<style scoped>
.alert-banner {
  background: var(--danger-light);
  border: 1px solid var(--danger);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-main);
}

.alert-banner.warning {
  background: var(--warning-light);
  border-color: var(--warning);
}

.alert-banner .icon {
  font-size: 0.875rem;
  font-weight: 700;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.alert-banner .message {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
