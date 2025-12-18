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

.freq-value {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) 0 var(--space-5) 0;
  position: relative;
}

.freq-value strong {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  transition: var(--transition);
  font-family: 'Inter', monospace;
}

.freq-value.updating strong {
  animation: pulse 0.5s;
}

.freq-value span {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 500;
}

.freq-label {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
