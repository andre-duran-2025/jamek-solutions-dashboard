<script setup>
import { useWebSocket } from '@/composables/useWebSocket'

const { formattedUptime, direction, systemState, lastUpdate, stats } = useWebSocket()
</script>

<template>
  <div class="card">
    <h3>Estatísticas do Sistema</h3>
    <div class="mini-stats">
      <div class="mini-stat">
        <div class="mini-stat-label">Uptime</div>
        <div class="mini-stat-value">{{ formattedUptime }}</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-label">Direção</div>
        <div class="mini-stat-value">{{ direction }}</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-label">Sistema</div>
        <div 
          class="mini-stat-value"
          :class="{
            highlight: systemState.includes('Online') || systemState === 'Estável',
            error: systemState.includes('Offline') || systemState.includes('Erro'),
            warning: systemState === 'Transitório' || systemState === 'Aguardando...'
          }"
        >{{ systemState }}</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-label">Última Atualização</div>
        <div class="mini-stat-value" style="font-size: 11px;">{{ lastUpdate }}</div>
      </div>
    </div>
    
    <div class="perf-stats">
      <div class="perf-item">
        <div class="perf-item-label">Comandos</div>
        <div class="perf-item-value">{{ stats.cmd }}</div>
      </div>
      <div class="perf-item">
        <div class="perf-item-label">Leituras</div>
        <div class="perf-item-value">{{ stats.read }}</div>
      </div>
      <div class="perf-item">
        <div class="perf-item-label">Erros</div>
        <div 
          class="perf-item-value"
          :style="{ color: stats.err > 0 ? 'var(--red)' : 'var(--primary)' }"
        >{{ stats.err }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card h3 {
  margin: 0 0 1rem 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.mini-stat {
  background: var(--bg);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: var(--transition);
}

.mini-stat:hover {
  border-color: var(--border-light);
}

.mini-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.mini-stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: 'Inter', monospace;
}

.mini-stat-value.highlight { color: var(--success); }
.mini-stat-value.error { color: var(--danger); }
.mini-stat-value.warning { color: var(--warning); }

.perf-stats {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}

.perf-item {
  text-align: center;
}

.perf-item-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 0.125rem;
}

.perf-item-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: 'Inter', monospace;
}
</style>
