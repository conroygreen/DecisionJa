<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

const props = defineProps({
  seatsData: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => ({
  labels: props.seatsData.map(seat => seat.party.toUpperCase()),
  datasets: [
    {
      label: 'Seats Won',
      data: props.seatsData.map(seat => seat.count),
      backgroundColor: props.seatsData.map(seat => seat.color),
      borderRadius: 6
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 200px;
  margin-top: 16px;
}
</style>