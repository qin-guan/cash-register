<template>
  <div class="chart">
    <h4>Expenses by Category</h4>
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

const totalExpenses = computed(() => 
  props.chartData.datasets[0].data.reduce((acc, curr) => acc + curr, 0)
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw || 0;
          const percentage = ((value / totalExpenses.value) * 100).toFixed(2);
          return `${label}: $${value.toFixed(2)} (${percentage}%)`;
        }
      }
    }
  }
};
</script>

<style scoped>
.chart {
  width: 48%;
  height: 300px;
  margin-bottom: 20px;
}
</style>