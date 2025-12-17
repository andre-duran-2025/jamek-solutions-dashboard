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
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--red);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-banner.warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--yellow);
}

.alert-banner .icon {
  font-size: 14px;
  font-weight: 700;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.alert-banner .message {
  flex: 1;
  font-size: 12px;
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
