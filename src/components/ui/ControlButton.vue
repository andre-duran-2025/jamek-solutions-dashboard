<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: Object, required: true },
  variant: { type: String, required: true, validator: v => ['start', 'stop', 'reset', 'default'].includes(v) },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['click']);

const variantStyles = {
  start: 'bg-success hover:bg-success/90 text-success-foreground border-success/50',
  stop: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive/50',
  reset: 'bg-warning hover:bg-warning/90 text-warning-foreground border-warning/50',
  default: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border',
};
</script>

<template>
  <button
    @click="emit('click')"
    :disabled="disabled"
    :class="cn(
      'flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-semibold',
      'transition-all duration-200 transform active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      variantStyles[variant]
    )"
  >
    <component :is="icon" class="w-5 h-5" />
    {{ label }}
  </button>
</template>
