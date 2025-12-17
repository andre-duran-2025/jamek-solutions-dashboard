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
            highlight: systemState === 'Estável' || systemState === 'ESP32 Online',
            error: systemState === 'ESP32 Offline',
            warning: systemState === 'Transitório'
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

.mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mini-stat {
  background: rgba(255,255,255,0.02);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.mini-stat:hover {
  background: rgba(255,255,255,0.04);
}

.mini-stat-label {
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 5px;
  font-weight: 600;
}

.mini-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.mini-stat-value.highlight { color: var(--green); }
.mini-stat-value.warning { color: var(--yellow); }
.mini-stat-value.error { color: var(--red); }

.perf-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 10px;
}

.perf-item {
  text-align: center;
  padding: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
  border: 1px solid var(--border);
}

.perf-item-label {
  font-size: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}

.perf-item-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}
</style>
