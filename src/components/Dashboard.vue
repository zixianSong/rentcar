<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const stats = ref({
  totalVehicles: 0,
  availableVehicles: 0,
  totalOrders: 0,
  totalRevenue: 0
});

let chartInstance = null;

const initChart = () => {
  const chartDom = document.getElementById('dashboard-chart');
  if (!chartDom) return;
  chartInstance = echarts.init(chartDom);
  const option = {
    title: {
      text: '企业租车平台数据概览',
      left: 'center',
      textStyle: { color: '#303133' }
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['总车辆数', '可用车辆数', '总订单数', '总收入'],
      axisLabel: { color: '#606266' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#606266' }
    },
    series: [{
      name: '统计数据',
      type: 'bar',
      data: [
        stats.value.totalVehicles,
        stats.value.availableVehicles,
        stats.value.totalOrders,
        stats.value.totalRevenue
      ],
      itemStyle: {
        color: params => ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'][params.dataIndex]
      },
      barWidth: '20%'
    }],
    grid: { left: '5%', right: '5%', bottom: '10%' }
  };
  chartInstance.setOption(option);
};

onMounted(async () => {
  try {
    const [totalVehicles, availableVehicles, totalOrders, revenue] = await Promise.all([
      axios.get('/api/total-vehicles'),
      axios.get('/api/available-vehicles-count'),
      axios.get('/api/total-orders'),
      axios.get('/api/total-revenue')
    ]);
    stats.value = {
      totalVehicles: totalVehicles.data.total,
      availableVehicles: availableVehicles.data.available,
      totalOrders: totalOrders.data.total,
      totalRevenue: revenue.data.total_revenue
    };
    initChart();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    ElMessage.error('加载数据失败');
  }

  window.addEventListener('resize', () => {
    if (chartInstance) chartInstance.resize();
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', () => {});
});
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div id="dashboard-chart" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>总车辆数</h3>
            <p>{{ stats.totalVehicles }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>可用车辆数</h3>
            <p>{{ stats.availableVehicles }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>总订单数</h3>
            <p>{{ stats.totalOrders }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>总收入</h3>
            <p>¥{{ stats.totalRevenue }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}
.stat-item {
  text-align: center;
}
.stat-item h3 {
  margin: 0;
  color: #303133;
}
.stat-item p {
  font-size: 24px;
  color: #409EFF;
  margin: 10px 0 0;
}
</style>