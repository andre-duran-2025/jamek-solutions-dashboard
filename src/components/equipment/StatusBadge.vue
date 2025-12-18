<script setup>
import { cn } from '@/lib/utils';
import { getStatusLabel } from '@/data/mockData';

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const statusStyles = {
  online: 'bg-success/20 text-success border-success/30',
  offline: 'bg-muted text-muted-foreground border-muted',
  fault: 'bg-destructive/20 text-destructive border-destructive/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
};

const dotStyles = {
  online: 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  offline: 'bg-neutral-500',
  fault: 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  warning: 'bg-warning shadow-[0_0_8px_rgba(234,179,8,0.6)]',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      statusStyles[status],
      sizeStyles[size]
    )"
  >
    <span :class="cn('rounded-full', dotStyles[status], dotSizes[size])" />
    <span v-if="showLabel">{{ getStatusLabel(status) }}</span>
  </span>
</template>
