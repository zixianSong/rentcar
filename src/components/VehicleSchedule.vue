<template>
  <div class="vehicle-schedule">
    <h2>车辆调度</h2>
    <el-form :model="scheduleForm" :rules="rules" ref="scheduleFormRef" label-width="120px" class="schedule-form">
      <el-form-item label="选择车辆" prop="vehicleId">
        <el-select v-model="scheduleForm.vehicleId" placeholder="请选择车辆" style="width: 100%;">
          <el-option v-for="vehicle in availableVehicles" :key="vehicle.vehicle_id" :label="`${vehicle.model} (${vehicle.license_plate})`" :value="vehicle.vehicle_id" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker v-model="scheduleForm.startDate" type="date" placeholder="选择日期" style="width: 100%;" value-format="yyyy-MM-dd" :disabled-date="disabledDate" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-time-picker v-model="scheduleForm.startTime" placeholder="选择时间" style="width: 100%;" value-format="HH:mm:ss" />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker v-model="scheduleForm.endDate" type="date" placeholder="选择日期" style="width: 100%;" value-format="yyyy-MM-dd" :disabled-date="disabledDate" />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-time-picker v-model="scheduleForm.endTime" placeholder="选择时间" style="width: 100%;" value-format="HH:mm:ss" />
      </el-form-item>
      <el-form-item label="调度地点" prop="locationId">
        <el-select v-model="scheduleForm.locationId" placeholder="请选择新位置" style="width: 100%;">
          <el-option v-for="location in availableLocations" :key="location.location_id" :label="`${location.province} ${location.city} ${location.district} - ${location.detailed_address}`" :value="location.location_id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="scheduleForm.status" placeholder="请选择状态" style="width: 100%;">
          <el-option label="预订" value="Reserved" />
          <el-option label="使用中" value="InUse" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitSchedule">提交调度</el-button>
        <el-button @click="resetForm">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';
import { ElMessage, ElForm } from 'element-plus';
import moment from 'moment';


const { proxy } = getCurrentInstance();
const scheduleForm = ref({
  vehicleId: null,
  startDate: moment().format('YYYY-MM-DD'),
  startTime: '09:00:00',
  endDate: moment().add(1, 'days').format('YYYY-MM-DD'),
  endTime: '17:00:00',
  locationId: null,
  status: null
});
const availableVehicles = ref([]);
const availableLocations = ref([]);
const scheduleFormRef = ref(null);
const rules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  locationId: [{ required: true, message: '请选择调度地点', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

// 禁用过去日期
const disabledDate = (date) => {
  return date < new Date(new Date().toDateString());
};

const fetchVehicles = async () => {
  try {
    const response = await axios.get('/api/available-vehicles');
    availableVehicles.value = response.data;
    console.log('Fetched vehicles:', response.data);
  } catch (error) {
    ElMessage.error(`获取车辆失败: ${error.message}`);
    console.error('Error fetching vehicles:', error);
  }
};

const fetchLocations = async () => {
  try {
    const response = await axios.get('/api/locations');
    availableLocations.value = response.data;
    console.log('Fetched locations:', response.data);
  } catch (error) {
    ElMessage.error(`获取地点失败: ${error.message}`);
    console.error('Error fetching locations:', error);
  }
};

const submitSchedule = async () => {
  if (!scheduleFormRef.value) return;
  await scheduleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/api/vehicles/schedule', {
          vehicleId: scheduleForm.value.vehicleId,
          startDate: scheduleForm.value.startDate,
          startTime: scheduleForm.value.startTime,
          endDate: scheduleForm.value.endDate,
          endTime: scheduleForm.value.endTime,
          locationId: scheduleForm.value.locationId,
          status: scheduleForm.value.status
        }, { withCredentials: true });
        ElMessage.success('调度成功');
        resetForm();
        await fetchVehicles(); // 刷新车辆列表
      } catch (error) {
        ElMessage.error(`调度失败: ${error.response?.data?.error || error.message}`);
        console.error('Error scheduling vehicle:', error.response ? error.response.data : error);
      }
    }
  });
};

const resetForm = () => {
  if (scheduleFormRef.value) {
    scheduleFormRef.value.resetFields();
  }
};

onMounted(() => {
  fetchVehicles();
  fetchLocations();
});
</script>

<style scoped>
.vehicle-schedule {
  padding: 20px;
}

.schedule-form {
  max-width: 500px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>