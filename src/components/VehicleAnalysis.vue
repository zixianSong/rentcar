<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { ElMessage } from 'element-plus'

let statusChart = null
let seatChart = null
let transmissionChart = null
let modelRevenueChart = null

const initStatusChart = (data) => {
  const dom = document.getElementById('status-chart')
  if (!dom) return
  statusChart = echarts.init(dom)
  statusChart.setOption({
    title: { text: '车辆状态分布', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      name: '状态',
      type: 'pie',
      radius: '50%',
      data: data.map(item => ({
        name: item.status,
        value: item.count
      }))
    }]
  })
}

const initSeatChart = (data) => {
  const dom = document.getElementById('seat-chart')
  if (!dom) return
  seatChart = echarts.init(dom)
  seatChart.setOption({
    title: { text: '座位数分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.map(item => `${item.seat_count}座`)
    },
    yAxis: { type: 'value' },
    series: [{
      name: '数量',
      type: 'bar',
      data: data.map(item => item.count),
      itemStyle: { color: '#67C23A' }
    }]
  })
}

const initTransmissionChart = (data) => {
  const dom = document.getElementById('transmission-chart')
  if (!dom) return
  transmissionChart = echarts.init(dom)
  transmissionChart.setOption({
    title: { text: '变速器类型占比', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      name: '类型',
      type: 'pie',
      radius: '50%',
      data: data.map(item => ({
        name: item.transmission_type,
        value: item.count
      }))
    }]
  })
}

const initModelRevenueChart = (data) => {
  const dom = document.getElementById('model-revenue-chart')
  if (!dom) return
  modelRevenueChart = echarts.init(dom)
  modelRevenueChart.setOption({
    title: { text: '各车型总收益排行', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.map(item => item.model),
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: { type: 'value', name: '收入 (元)' },
    series: [{
      name: '收入',
      type: 'bar',
      data: data.map(item => item.total_revenue),
      itemStyle: { color: '#F56C6C' }
    }]
  })
}

const fetchAll = async () => {
  try {
    const [statusRes, seatRes, transmissionRes, revenueRes] = await Promise.all([
      axios.get('/api/vehicle-status-summary'),
      axios.get('/api/seat-count-summary'),
      axios.get('/api/transmission-summary'),
      axios.get('/api/model-revenue-summary')
    ])
    initStatusChart(statusRes.data)
    initSeatChart(seatRes.data)
    initTransmissionChart(transmissionRes.data)
    initModelRevenueChart(revenueRes.data)
  } catch (e) {
    console.error('加载车辆分析数据失败:', e)
    ElMessage.error('加载车辆分析失败')
  }
}

onMounted(() => {
  fetchAll()
  window.addEventListener('resize', () => {
    statusChart?.resize()
    seatChart?.resize()
    transmissionChart?.resize()
    modelRevenueChart?.resize()
  })
})

onUnmounted(() => {
  statusChart?.dispose()
  seatChart?.dispose()
  transmissionChart?.dispose()
  modelRevenueChart?.dispose()
})
</script>

<template>
  <div class="vehicle-analysis">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card><div id="status-chart" class="chart-box" /></el-card>
      </el-col>
      <el-col :span="12">
        <el-card><div id="transmission-chart" class="chart-box" /></el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card><div id="seat-chart" class="chart-box" /></el-card>
      </el-col>
      <el-col :span="12">
        <el-card><div id="model-revenue-chart" class="chart-box" /></el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.vehicle-analysis {
  padding: 20px;
}
.chart-box {
  width: 100%;
  min-height: 360px;
}
</style>
