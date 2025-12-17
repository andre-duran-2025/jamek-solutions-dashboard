<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: String,
  value: [Number, String],
  label: String
})

const isUpdating = ref(false)

watch(() => props.value, () => {
  isUpdating.value = true
  setTimeout(() => {
    isUpdating.value = false
  }, 500)
})
</script>

<template>
  <div class="card">
    <h3>{{ title }}</h3>
    <div class="freq-value" :class="{ updating: isUpdating }">
      <strong>{{ value }}</strong>
      <span>Hz</span>
      <span class="freq-label">{{ label }}</span>
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

.freq-value {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 6px;
  padding: 12px 0 20px 0;
  position: relative;
}

.freq-value strong {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  transition: all 0.3s;
}

.freq-value.updating strong {
  animation: pulse 0.5s;
}

.freq-value span {
  font-size: 16px;
  color: var(--muted);
  font-weight: 500;
}

.freq-label {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
