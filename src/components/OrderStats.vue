<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const orderData = ref([])
let statusChart = null
let dailyChart = null

const initStatusChart = (statusCounts) => {
  const chartDom = document.getElementById('order-status-chart')
  if (!chartDom) return
  statusChart = echarts.init(chartDom)

  const option = {
    title: {
      text: '订单状态分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '50%',
        data: Object.entries(statusCounts).map(([status, count]) => ({
          name: status,
          value: count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  statusChart.setOption(option)
}

const initDailyChart = (dailyCounts) => {
  const chartDom = document.getElementById('daily-orders-chart')
  if (!chartDom) return
  dailyChart = echarts.init(chartDom)

  const sortedDates = Object.keys(dailyCounts).sort()
  const option = {
    title: {
      text: '每日订单量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: sortedDates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: sortedDates.map(date => dailyCounts[date]),
        type: 'bar',
        name: '订单数',
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  dailyChart.setOption(option)
}

const prepareData = (orders) => {
  const statusCounts = {}
  const dailyCounts = {}

  orders.forEach(order => {
    // 统计状态分布
    const status = order.order_status || 'Unknown'
    statusCounts[status] = (statusCounts[status] || 0) + 1

    // 统计每日订单数（按 start_date）
    const date = new Date(order.start_date).toISOString().slice(0, 10)
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  return { statusCounts, dailyCounts }
}

const fetchOrders = async () => {
  try {
    const res = await axios.get('/api/orders') // 已设置代理
    orderData.value = res.data

    const { statusCounts, dailyCounts } = prepareData(orderData.value)
    initStatusChart(statusCounts)
    initDailyChart(dailyCounts)
  } catch (error) {
    console.error('订单统计加载失败:', error)
    ElMessage.error('加载订单统计失败')
  }
}

onMounted(() => {
  fetchOrders()
  window.addEventListener('resize', () => {
    statusChart?.resize()
    dailyChart?.resize()
  })
})

onUnmounted(() => {
  statusChart?.dispose()
  dailyChart?.dispose()
  statusChart = null
  dailyChart = null
})
</script>

<template>
  <div class="order-stats">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div id="order-status-chart" style="width: 100%; height: 400px;" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div id="daily-orders-chart" style="width: 100%; height: 400px;" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.order-stats {
  padding: 20px;
}
</style>
