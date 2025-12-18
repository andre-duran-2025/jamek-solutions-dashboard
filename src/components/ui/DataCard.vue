<script setup>
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  icon: { type: Object, default: null },
  variant: { type: String, default: 'default' }
});

const variantStyles = {
  default: 'border-border',
  success: 'border-success/30 bg-success/5',
  warning: 'border-warning/30 bg-warning/5',
  danger: 'border-destructive/30 bg-destructive/5',
};

const iconStyles = {
  default: 'text-primary bg-primary/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  danger: 'text-destructive bg-destructive/10',
};
</script>

<template>
  <div :class="cn(
    'bg-card border rounded-xl p-4 transition-all duration-300 hover:border-primary/30',
    variantStyles[variant],
    $attrs.class
  )">
    <div class="flex items-start justify-between mb-3">
      <p class="text-sm text-muted-foreground font-medium">{{ title }}</p>
      <div v-if="icon" :class="cn('w-8 h-8 rounded-lg flex items-center justify-center', iconStyles[variant])">
        <component :is="icon" class="w-4 h-4" />
      </div>
    </div>
    <div class="flex items-baseline gap-1">
      <span class="text-2xl font-bold text-foreground">{{ value }}</span>
      <span v-if="unit" class="text-sm text-muted-foreground">{{ unit }}</span>
    </div>
  </div>
</template>
