<template>
  <div class="vehicle-schedule">
    <h2>车辆调度</h2>
    <el-form :model="scheduleForm" :rules="rules" ref="scheduleFormRef" label-width="120px" class="schedule-form">
      <el-form-item label="选择车辆" prop="vehicleId">
        <el-select
            v-model="scheduleForm.vehicleId"
            placeholder="请选择车辆"
            style="width: 100%;"
            @change="handleVehicleChange"
            filterable
            clearable
        >
          <el-option
              v-for="vehicle in availableVehicles"
              :key="vehicle.vehicle_id"
              :label="`${vehicle.model} (${vehicle.license_plate}) - ${vehicle.status}`"
              :value="vehicle.vehicle_id"
              :disabled="vehicle.status !== 'Available'"
          >
            <span style="float: left">{{ vehicle.model }} ({{ vehicle.license_plate }})</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ vehicle.status === 'Available' ? '可用' : '不可用' }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
            v-model="scheduleForm.startDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
            :disabled-date="disabledStartDate"
            @change="validateDateTime('start')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="开始时间" prop="startTime">
        <el-time-picker
            v-model="scheduleForm.startTime"
            placeholder="选择时间"
            style="width: 100%;"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            @change="validateDateTime('start')"
        />
      </el-form-item>

      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
            v-model="scheduleForm.endDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
            :disabled-date="disabledEndDate"
            @change="validateDateTime('end')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-time-picker
            v-model="scheduleForm.endTime"
            placeholder="选择时间"
            style="width: 100%;"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            @change="validateDateTime('end')"
        />
      </el-form-item>

      <el-form-item label="调度地点" prop="locationId">
        <el-select
            v-model="scheduleForm.locationId"
            placeholder="请选择新位置"
            style="width: 100%;"
            filterable
            clearable
        >
          <el-option
              v-for="location in availableLocations"
              :key="location.location_id"
              :label="`${location.province} ${location.city} ${location.district} - ${location.detailed_address}`"
              :value="location.location_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
            v-model="scheduleForm.status"
            placeholder="请选择状态"
            style="width: 100%;"
        >
          <el-option label="预订" value="Reserved" />
          <el-option label="使用中" value="InUse" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitSchedule" :loading="submitting">
          提交调度
        </el-button>
        <el-button @click="resetForm">取消</el-button>
      </el-form-item>
    </el-form>

    <!-- 车辆详情卡片 -->
    <el-card v-if="selectedVehicle" class="vehicle-card">
      <div slot="header">
        <span>车辆详情</span>
      </div>
      <div class="vehicle-info">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>型号：</label>
              <span>{{ selectedVehicle.model }}</span>
            </div>
            <div class="info-item">
              <label>车牌号：</label>
              <span>{{ selectedVehicle.license_plate }}</span>
            </div>
            <div class="info-item">
              <label>座位数：</label>
              <span>{{ selectedVehicle.seat_count }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>变速类型：</label>
              <span>{{ selectedVehicle.transmission_type }}</span>
            </div>
            <div class="info-item">
              <label>日租价格：</label>
              <span>¥{{ selectedVehicle.daily_rate }}</span>
            </div>
            <div class="info-item">
              <label>时租价格：</label>
              <span>¥{{ selectedVehicle.hourly_rate }}</span>
            </div>
          </el-col>
        </el-row>
        <div class="info-item" v-if="selectedVehicle.image_url">
          <label>车辆图片：</label>
          <el-image
              :src="selectedVehicle.image_url"
              :preview-src-list="[selectedVehicle.image_url]"
              style="width: 200px; height: 120px; margin-top: 10px;"
              fit="cover"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import axios from 'axios'
import {ElMessage} from 'element-plus'

// 表单数据
const scheduleForm = ref({
  vehicleId: null,
  startDate: null,
  startTime: null,
  endDate: null,
  endTime: null,
  locationId: null,
  status: null
})

// 状态管理
const availableVehicles = ref([])
const availableLocations = ref([])
const scheduleFormRef = ref(null)
const submitting = ref(false)

// 表单验证规则
const rules = {
  vehicleId: [{required: true, message: '请选择车辆', trigger: 'change'}],
  startDate: [
    {required: true, message: '请选择开始日期', trigger: 'change'},
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(new Error('日期不能为空'))
        callback()
      }
    }
  ],
  startTime: [
    {required: true, message: '请选择开始时间', trigger: 'change'},
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(new Error('时间不能为空'))
        callback()
      }
    }
  ],
  endDate: [
    {required: true, message: '请选择结束日期', trigger: 'change'},
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(new Error('日期不能为空'))

        // 检查结束日期是否在开始日期之后
        if (scheduleForm.value.startDate && scheduleForm.value.startTime) {
          const startDateTime = new Date(`${scheduleForm.value.startDate} ${scheduleForm.value.startTime}`)
          const endDateTime = new Date(`${scheduleForm.value.endDate} ${scheduleForm.value.endTime || '00:00:00'}`)

          if (endDateTime < startDateTime) {
            return callback(new Error('结束日期不能早于开始日期'))
          }
        }

        callback()
      }
    }
  ],
  endTime: [
    {required: true, message: '请选择结束时间', trigger: 'change'},
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(new Error('时间不能为空'))

        // 检查结束时间是否在开始时间之后（当日期相同时）
        if (scheduleForm.value.startDate === scheduleForm.value.endDate) {
          const startTime = scheduleForm.value.startTime
          if (value < startTime) {
            return callback(new Error('结束时间不能早于开始时间'))
          }
        }

        callback()
      }
    }
  ],
  locationId: [{required: true, message: '请选择调度地点', trigger: 'change'}],
  status: [{required: true, message: '请选择状态', trigger: 'change'}]
}

// 计算属性：当前选中的车辆
const selectedVehicle = computed(() => {
  return availableVehicles.value.find(v => v.vehicle_id === scheduleForm.value.vehicleId) || null
})

// 生命周期钩子
onMounted(() => {
  fetchAvailableVehicles()
  fetchLocations()
})

// 禁用过去的日期（开始日期）
const disabledStartDate = (date) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return date < now
}

// 禁用过去的日期（结束日期）
const disabledEndDate = (date) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // 如果已选择开始日期，结束日期不能早于开始日期
  if (scheduleForm.value.startDate) {
    const startDate = new Date(scheduleForm.value.startDate)
    return date < startDate || date < now
  }

  return date < now
}

// 验证日期和时间
const validateDateTime = (type) => {
  if (!scheduleFormRef.value) return

  if (type === 'start') {
    scheduleFormRef.value.validateField('startDate')
    scheduleFormRef.value.validateField('startTime')
  } else {
    scheduleFormRef.value.validateField('endDate')
    scheduleFormRef.value.validateField('endTime')
  }

  // 当开始日期和时间都设置后，验证结束日期
  if (scheduleForm.value.startDate && scheduleForm.value.startTime) {
    scheduleFormRef.value.validateField('endDate')
    scheduleFormRef.value.validateField('endTime')
  }
}

const fetchAvailableVehicles = async () => {
  try {
    const response = await axios.get('/api/available-vehicles', {
      params: {
        startDate: scheduleForm.value.startDate,
        endDate: scheduleForm.value.endDate
      }
    })

    // 使用Map进行车辆去重
    const vehicleMap = new Map()

    response.data.forEach(item => {
      if (!vehicleMap.has(item.vehicle_id)) {
        // 创建新车辆记录
        vehicleMap.set(item.vehicle_id, {
          ...item,
          image_urls: item.image_url ? [item.image_url] : []
        })
      } else {
        // 更新已有车辆记录的图片
        const existing = vehicleMap.get(item.vehicle_id)
        if (item.image_url) {
          existing.image_urls.push(item.image_url)
        }
      }
    })

    // 转换为数组并设置默认图片
    availableVehicles.value = Array.from(vehicleMap.values()).map(vehicle => {
      return {
        ...vehicle,
        image_url: vehicle.image_urls.length > 0 ? vehicle.image_urls[0] : null
      }
    })
  } catch (error) {
    ElMessage.error(`获取车辆失败: ${error.message}`)
    console.error('Error fetching vehicles:', error)
  }
}

// 获取所有地点
const fetchLocations = async () => {
  try {
    const response = await axios.get('/api/locations')
    availableLocations.value = response.data
  } catch (error) {
    ElMessage.error(`获取地点失败: ${error.message}`)
    console.error('Error fetching locations:', error)
  }
}

// 车辆选择变化处理
const handleVehicleChange = (vehicleId) => {
  if (vehicleId) {
    const vehicle = availableVehicles.value.find(v => v.vehicle_id === vehicleId)
    if (vehicle) {
      // 自动填充车辆当前位置
      scheduleForm.value.locationId = vehicle.location_id
    }
  }
}

// 提交调度
const submitSchedule = async () => {
  if (!scheduleFormRef.value) return

  try {
    submitting.value = true
    await scheduleFormRef.value.validate()

    const response = await axios.post('/api/vehicles/schedule', {
      vehicleId: scheduleForm.value.vehicleId,
      startDate: scheduleForm.value.startDate,
      startTime: scheduleForm.value.startTime,
      endDate: scheduleForm.value.endDate,
      endTime: scheduleForm.value.endTime,
      locationId: scheduleForm.value.locationId,
      status: scheduleForm.value.status
    }, {
      withCredentials: true
    })

    ElMessage.success(response.data.message || '调度成功')
    resetForm()
    await fetchAvailableVehicles() // 刷新车辆列表
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message
    ElMessage.error(`调度失败: ${errorMsg}`)
    console.error('Error scheduling vehicle:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (scheduleFormRef.value) {
    scheduleFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.vehicle-schedule {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.schedule-form {
  margin-bottom: 20px;
}

.vehicle-card {
  margin-top: 20px;
}

.vehicle-info {
  padding: 10px;
}

.info-item {
  margin-bottom: 10px;
  line-height: 1.6;
}

.info-item label {
  display: inline-block;
  width: 100px;
  font-weight: bold;
  color: #606266;
}

.info-item span {
  color: #303133;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>