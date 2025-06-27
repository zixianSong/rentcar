<template>
  <div class="inventory-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span>当前库存</span>
          <el-button
              type="primary"
              style="margin-left: 3vw"
              @click="timeFilterDialogVisible = true"
          >
            <el-icon><calendar /></el-icon>
            有效时间筛选
          </el-button>
        </div>
      </template>

      <!-- 时间筛选对话框 -->
      <el-dialog
          v-model="timeFilterDialogVisible"
          title="有效时间筛选"
          width="500px"
      >
        <el-form label-width="100px">
          <el-form-item label="时间范围">
            <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期时间"
                end-placeholder="结束日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="resetTimeFilter">重置</el-button>
          <el-button type="primary" @click="applyTimeFilter">确定</el-button>
        </template>
      </el-dialog>

      <el-table :data="filteredData" border stripe>
        <el-table-column prop="inventory_id" label="库存ID" width="80" />
        <el-table-column prop="vehicle_id" label="车辆ID" width="80" />

        <el-table-column
            prop="model"
            label="车型"
            :filters="modelFilters"
            :filter-method="filterModel"
            filter-placement="bottom-end"
        />

        <el-table-column
            prop="status"
            label="状态"
            :filters="statusFilters"
            :filter-method="filterStatus"
            filter-placement="bottom-end"
        />

        <el-table-column
            prop="transmission_type"
            label="变速器"
            :filters="transmissionFilters"
            :filter-method="filterTransmission"
            filter-placement="bottom-end"
        />

        <el-table-column
            label="有效时间段"
            :formatter="formatDateRange"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'

// 库存数据列表
const inventoryData = ref([])
const timeFilterDialogVisible = ref(false)
const timeRange = ref([])

// 计算属性用于表格数据
const filteredData = computed(() => {
  return inventoryData.value
})

// 页面加载时获取库存数据
onMounted(async () => {
  try {
    const response = await axios.get('/api/inventory')
    processInventoryData(response.data)
  } catch (error) {
    console.error('获取库存数据失败:', error)
    ElMessage.error('无法加载库存数据')
  }
})

// 处理库存数据
const processInventoryData = (data) => {
  inventoryData.value = (Array.isArray(data) ? data : [data]).map(item => ({
    ...item,
    start_date: item.start_date || null,
    end_date: item.end_date || null,
    start_time: item.start_time || '00:00:00',
    end_time: item.end_time || '23:59:59'
  }))
}

// 应用时间筛选
const applyTimeFilter = async () => {
  if (!timeRange.value || timeRange.value.length !== 2) {
    ElMessage.warning('请选择完整的时间范围')
    return
  }

  const [startDateTime, endDateTime] = timeRange.value
  timeFilterDialogVisible.value = false

  try {
    const params = {
      start_datetime: startDateTime,
      end_datetime: endDateTime
    }

    const response = await axios.get('/api/inventory', { params })
    processInventoryData(response.data)
    ElMessage.success('筛选成功')
  } catch (error) {
    console.error('筛选数据失败:', error)
    ElMessage.error('筛选数据失败')
  }
}

// 重置时间筛选
const resetTimeFilter = () => {
  timeRange.value = []
  fetchAllData()
}

// 获取全部数据
const fetchAllData = async () => {
  try {
    const response = await axios.get('/api/inventory')
    processInventoryData(response.data)
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  }
}

/**
 * 将日期和时间字段组合成人类可读的字符串
 */
const combineDateTime = (date, time) => {
  if (!date || !time) {
    console.warn('缺少日期或时间参数:', {date, time})
    return '无效时间'
  }

  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      console.warn('无效的日期格式:', date)
      return '无效时间'
    }

    const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
    const dateStr = `${localDate.getFullYear()}/${localDate.getMonth() + 1}/${localDate.getDate()}`

    let timeStr = String(time)
        .split('.')[0] // 去除毫秒部分
        .replace(/(\d{2}):(\d{2}):(\d{2}).*/, '$1:$2:$3') // 确保格式

    return `${dateStr} ${timeStr}`
  } catch (error) {
    console.error('日期时间处理错误:', error, {date, time})
    return '无效时间'
  }
}

/**
 * 表格中"有效时间段"列使用的格式化函数
 */
const formatDateRange = (row) => {
  const start = combineDateTime(row.start_date, row.start_time)
  const end = combineDateTime(row.end_date, row.end_time)
  return `${start} ~ ${end}`
}

// 过滤选项（示例）
const modelFilters = [
  { text: 'Toyota Camry', value: 'Toyota Camry' },
  { text: 'Honda Accord', value: 'Honda Accord' }
]

const statusFilters = [
  { text: 'Available', value: 'Available' },
  { text: 'Reserved', value: 'Reserved' }
]

const transmissionFilters = [
  { text: 'Automatic', value: 'Automatic' },
  { text: 'Manual', value: 'Manual' }
]

// 过滤方法
const filterModel = (value, row) => row.model === value
const filterStatus = (value, row) => row.status === value
const filterTransmission = (value, row) => row.transmission_type === value
</script>

<style scoped>
.inventory-container {
  padding: 10px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-dialog__body {
  padding: 20px;
}
</style>