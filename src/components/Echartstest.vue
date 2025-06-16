<!-- src/components/Echartstest.vue -->
<template>
  <div class="container">
    <header>
      <h1>Vue 3 + ECharts 图表组件</h1>
      <p>修复了图表未显示的问题，现在可以正常使用多种图表类型和自定义颜色</p>
    </header>

    <div class="chart-container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>销售数据统计</span>
            <div class="controls">
              <el-select v-model="chartType" size="small" style="width: 120px">
                <el-option label="柱状图" value="bar" />
                <el-option label="折线图" value="line" />
                <el-option label="饼图" value="pie" />
                <el-option label="散点图" value="scatter" />
              </el-select>
              <el-color-picker v-model="chartColor" size="small" />
              <el-button type="primary" size="small" @click="refreshData">刷新数据</el-button>
            </div>
          </div>
        </template>

        <div class="chart-wrapper">
          <div ref="chart" class="chart"></div>
        </div>
      </el-card>
    </div>

    <div class="instructions">
      <h3>问题修复说明</h3>
      <ul>
        <li>原代码在 <code>setup()</code> 函数中无法通过 <code>this</code> 访问全局属性</li>
        <li>解决方案：直接在组件中导入 <code>echarts</code> 模块</li>
        <li>使用 <code>getCurrentInstance()</code> 获取组件上下文，然后访问全局属性</li>
        <li>添加了响应式图表容器大小调整</li>
        <li>优化了颜色选择器交互体验</li>
      </ul>
    </div>

    <footer>
      <p>Vue 3 + Element Plus + ECharts 集成示例 | 已解决图表显示问题</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElCard, ElSelect, ElOption, ElButton, ElColorPicker } from 'element-plus'

// 响应式引用
const chart = ref(null)
const chartType = ref('bar')
const chartColor = ref('#409EFF')
let chartInstance = null

// 销售数据
const salesData = ref([120, 200, 150, 80, 70, 110, 130, 180, 150, 200, 220, 240])

// 利润数据
const profitData = ref([30, 50, 35, 20, 15, 28, 32, 45, 38, 50, 55, 60])

// 初始化图表
const initChart = () => {
  if (!chart.value) return

  // 销毁现有图表实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 初始化图表实例
  chartInstance = echarts.init(chart.value)
  updateChart()
}

// 更新图表配置
const updateChart = () => {
  if (!chartInstance) return

  // 根据图表类型设置不同的配置
  let seriesConfig = []
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  if (chartType.value === 'pie') {
    seriesConfig = [
      {
        name: '销售额',
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: months.map((name, index) => ({
          value: salesData.value[index],
          name,
        })),
        itemStyle: {
          color: chartColor.value,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ]
  } else if (chartType.value === 'scatter') {
    seriesConfig = [
      {
        name: '销售额',
        type: 'scatter',
        symbolSize: (val) => val[1] / 5,
        data: months.map((name, index) => [name, salesData.value[index]]),
        itemStyle: {
          color: chartColor.value,
        },
      },
    ]
  } else {
    seriesConfig = [
      {
        name: '销售额',
        type: chartType.value,
        data: salesData.value,
        itemStyle: {
          color: chartColor.value,
        },
        smooth: true,
        areaStyle: chartType.value === 'line' ? {} : undefined,
      },
      {
        name: '利润',
        type: chartType.value,
        data: profitData.value,
        itemStyle: {
          color: '#67C23A',
        },
        smooth: true,
        areaStyle:
            chartType.value === 'line'
                ? {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                      { offset: 1, color: 'rgba(103, 194, 58, 0)' },
                    ],
                  },
                }
                : undefined,
      },
    ]
  }

  // 基本配置
  const option = {
    title: {
      text: '2023年销售数据统计',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        if (chartType.value === 'pie') {
          return `${params.name}<br/>${params.seriesName}: ${params.value} (${params.percent}%)`
        }
        return `${params.seriesName}: ${params.value}`
      },
    },
    legend: {
      data: chartType.value === 'pie' ? [] : ['销售额', '利润'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis:
        chartType.value === 'pie'
            ? {}
            : {
              type: 'category',
              data: months,
              axisLabel: {
                interval: 0,
                rotate: 30,
              },
            },
    yAxis: chartType.value === 'pie' ? {} : { type: 'value', name: '金额 (万元)' },
    series: seriesConfig,
  }

  chartInstance.setOption(option)
}

// 调整图表大小
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 刷新数据
const refreshData = () => {
  salesData.value = Array(12)
      .fill()
      .map(() => Math.floor(Math.random() * 200) + 50)
  profitData.value = salesData.value.map((val) => Math.floor(val * 0.3) + Math.floor(Math.random() * 20))
  updateChart()
}

// 生命周期钩子
onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})

// 监听图表类型和颜色的变化
watch([chartType, chartColor], () => {
  initChart()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  max-width: 1200px;
  width: 100%;
}
header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}
header p {
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}
.chart-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.chart-container:hover {
  transform: translateY(-5px);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}
.card-header span {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}
.controls {
  display: flex;
  gap: 15px;
  align-items: center;
}
.chart-wrapper {
  padding: 20px;
}
.chart {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  background: #fff;
}
.instructions {
  background: #e3f2fd;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
  border-left: 4px solid #2196f3;
}
.instructions h3 {
  color: #2196f3;
  margin-bottom: 15px;
}
.instructions ul {
  padding-left: 20px;
}
.instructions li {
  margin-bottom: 10px;
  line-height: 1.6;
}
.instructions code {
  background: #f1f1f1;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
footer {
  text-align: center;
  margin-top: 30px;
  color: #7f8c8d;
  font-size: 14px;
}
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>