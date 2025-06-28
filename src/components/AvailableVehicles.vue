<template>
  <div class="container">
    <h1>可用车辆</h1>
    <el-row :gutter="20" v-if="uniqueVehicles.length">
      <el-col :span="8" v-for="vehicle in uniqueVehicles" :key="vehicle.vehicle_id">
        <el-card class="vehicle-card" shadow="hover">
          <el-carousel height="200px" v-if="vehicle.imageUrls && vehicle.imageUrls.length">
            <el-carousel-item v-for="(imageUrl, index) in vehicle.imageUrls" :key="index">
              <img :src="imageUrl" alt="Vehicle" class="vehicle-image" @error="handleImageError" />
            </el-carousel-item>
          </el-carousel>
          <img v-else src="/src/assets/HondaCivic.jpeg" alt="Vehicle" class="vehicle-image" />
          <div class="vehicle-info">
            <h3>{{ vehicle.model }}</h3>
            <p>车牌: {{ vehicle.license_plate }}</p>
            <p>座位: {{ vehicle.seat_count }}</p>
            <p>变速器: {{ vehicle.transmission_type === 'Automatic' ? '自动' : '手动' }}</p>
            <p>位置: {{ vehicle.city }} - {{ vehicle.detailed_address }}</p>
            <p>日租: ¥{{ vehicle.daily_rate }} | 小时租: ¥{{ vehicle.hourly_rate }}</p>
            <el-button type="primary" @click="openRentDialog(vehicle.vehicle_id)">立即租车</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-else description="暂无可用车辆" />

    <!-- 租车对话框 -->
    <el-dialog title="租车信息" v-model="rentDialogVisible" width="30%">
      <el-form :model="rentForm" :rules="rentRules" ref="rentFormRef" label-width="100px">
        <el-form-item label="车辆ID" prop="vehicleId">
          <el-input v-model="rentForm.vehicleId" disabled />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
              v-model="rentForm.startDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%;"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
              @change="validateDateTime('start')"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
              v-model="rentForm.startTime"
              placeholder="选择时间"
              style="width: 100%;"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              @change="validateDateTime('start')"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
              v-model="rentForm.endDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%;"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
              @change="validateDateTime('end')"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
              v-model="rentForm.endTime"
              placeholder="选择时间"
              style="width: 100%;"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              @change="validateDateTime('end')"
          />
        </el-form-item>
        <el-form-item label="租车地点" prop="locationId">
          <el-select v-model="rentForm.locationId" placeholder="请选择或添加新位置" style="width: 100%;">
            <el-option v-for="location in availableLocations" :key="location.location_id" :label="`${location.province} ${location.city} ${location.district} - ${location.detailed_address}`" :value="location.location_id">
              <span>{{ location.province }} {{ location.city }} {{ location.district }} - {{ location.detailed_address }}</span>
            </el-option>
            <el-option disabled style="color: #999;">------- 添加新地点 -------</el-option>
            <el-option @click="openAddLocationDialog" style="color: #409EFF;">+ 添加新地点</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="rentForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="预订" value="Reserved" />
            <el-option label="使用中" value="InUse" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRent">确认租车</el-button>
      </template>
    </el-dialog>

    <!-- 添加新地点对话框 -->
    <el-dialog title="添加新地点" v-model="addLocationDialogVisible" width="30%">
      <el-form :model="newLocationForm" :rules="locationRules" ref="addLocationFormRef" label-width="100px">
        <el-form-item label="省份" prop="province">
          <el-input v-model="newLocationForm.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="newLocationForm.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区/县" prop="district">
          <el-input v-model="newLocationForm.district" placeholder="请输入区/县" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailedAddress">
          <el-input v-model="newLocationForm.detailedAddress" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="newLocationForm.longitude" placeholder="请输入经度 (例如 116.4073940)" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="newLocationForm.latitude" placeholder="请输入纬度 (例如 39.9042110)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addLocationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddLocation">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { ElMessage, ElRow, ElCol, ElCard, ElButton, ElEmpty, ElCarousel, ElCarouselItem, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';

const vehicles = ref([]);
const rentDialogVisible = ref(false);
const addLocationDialogVisible = ref(false);
const rentForm = ref({
  vehicleId: null,
  startDate: null,
  startTime: null,
  endDate: null,
  endTime: null,
  locationId: null,
  status: null
});
const newLocationForm = ref({
  province: '',
  city: '',
  district: '',
  detailedAddress: '',
  longitude: '',
  latitude: ''
});
const rentFormRef = ref(null);
const addLocationFormRef = ref(null);
const availableLocations = ref([]);
const rentRules = {
  vehicleId: [{ required: true, message: '车辆ID必填', trigger: 'change' }],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || isNaN(new Date(value))) {
          callback(new Error('日期格式无效'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || !/^\d{2}:\d{2}:\d{2}$/.test(value)) {
          callback(new Error('时间格式无效'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(new Error('结束日期不能为空'));
        if (rentForm.value.startDate && rentForm.value.startTime) {
          const startDateTime = new Date(`${rentForm.value.startDate} ${rentForm.value.startTime}`);
          const endDateTime = new Date(`${value} ${rentForm.value.endTime || '00:00:00'}`);
          if (endDateTime < startDateTime) {
            return callback(new Error('结束日期不能早于开始日期'));
          }
        }
        callback();
      },
      trigger: 'change'
    }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(new Error('结束时间不能为空'));
        if (rentForm.value.startDate === rentForm.value.endDate && rentForm.value.startTime) {
          if (value < rentForm.value.startTime) {
            return callback(new Error('结束时间不能早于开始时间'));
          }
        }
        callback();
      },
      trigger: 'change'
    }
  ],
  locationId: [{ required: true, message: '请选择调度地点', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};
const locationRules = {
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区/县', trigger: 'blur' }],
  detailedAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  longitude: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (isNaN(value) || value < -180 || value > 180) {
          callback(new Error('经度必须是-180到180之间的数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  latitude: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (isNaN(value) || value < -90 || value > 90) {
          callback(new Error('纬度必须是-90到90之间的数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 获取可用车辆
const fetchVehicles = async () => {
  try {
    const response = await axios.get('/api/available-vehicles');
    vehicles.value = Array.isArray(response.data) ? response.data : [];
    console.log('Fetched vehicles:', response.data); // 调试日志
  } catch (error) {
    ElMessage.error(`获取车辆信息失败: ${error.message}`);
    console.error('Error fetching vehicles:', error);
    vehicles.value = [];
  }
};

// 去重并聚合图片
const uniqueVehicles = computed(() => {
  const vehicleMap = new Map();

  vehicles.value.forEach(vehicle => {
    if (!vehicleMap.has(vehicle.vehicle_id)) {
      vehicleMap.set(vehicle.vehicle_id, {
        ...vehicle,
        imageUrls: []
      });
    }

    const currentVehicle = vehicleMap.get(vehicle.vehicle_id);
    if (vehicle.image_url) {
      currentVehicle.imageUrls.push(processImageUrl(vehicle.image_url));
    }
  });

  return Array.from(vehicleMap.values());
});

// 处理图片URL
const processImageUrl = (url) => {
  if (!url) return '/src/assets/HondaCivic.jpeg';

  // 处理相对路径
  if (url.startsWith('../assets/')) {
    return url.replace('../assets/', '/src/assets/');
  }

  // 处理绝对路径
  if (url.startsWith('/assets/')) {
    return url.replace('/assets/', '/src/assets/');
  }

  // 处理完整URL（如来自数据库的）
  if (url.startsWith('http')) {
    return url;
  }

  return '/src/assets/HondaCivic.jpeg';
};

const handleImageError = (event) => {
  event.target.src = '/src/assets/HondaCivic.jpeg';
};

// 验证日期和时间
const validateDateTime = (type) => {
  if (!rentFormRef.value) return;

  if (type === 'start') {
    rentFormRef.value.validateField('startDate');
    rentFormRef.value.validateField('startTime');
  } else {
    rentFormRef.value.validateField('endDate');
    rentFormRef.value.validateField('endTime');
  }

  // 当开始日期和时间都设置后，验证结束日期
  if (rentForm.value.startDate && rentForm.value.startTime) {
    rentFormRef.value.validateField('endDate');
    rentFormRef.value.validateField('endTime');
  }
};

const openRentDialog = (vehicleId) => {
  rentForm.value = {
    vehicleId,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    locationId: null,
    status: null
  };
  rentDialogVisible.value = true;
  fetchLocations(); // 确保在对话框打开时加载地点
};

const fetchLocations = async () => {
  try {
    const response = await axios.get('/api/locations');
    if (Array.isArray(response.data)) {
      availableLocations.value = response.data.map(location => ({
        location_id: location.location_id,
        province: location.province || '未知',
        city: location.city || '未知',
        district: location.district || '未知',
        detailed_address: location.detailed_address || '未知'
      }));
      console.log('Fetched locations:', availableLocations.value); // 调试日志
    } else {
      availableLocations.value = [];
      console.warn('Locations data is not an array:', response.data);
    }
  } catch (error) {
    ElMessage.error(`获取地点失败: ${error.message}`);
    console.error('Error fetching locations:', error);
    availableLocations.value = [];
  }
};

const openAddLocationDialog = () => {
  newLocationForm.value = {
    province: '',
    city: '',
    district: '',
    detailedAddress: '',
    longitude: '',
    latitude: ''
  };
  addLocationDialogVisible.value = true;
};

const confirmAddLocation = async () => {
  if (!addLocationFormRef.value) return;
  await addLocationFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        console.log('Submitting location data:', newLocationForm.value); // 调试日志
        const response = await axios.post('/api/locations', {
          province: newLocationForm.value.province,
          city: newLocationForm.value.city,
          district: newLocationForm.value.district,
          detailed_address: newLocationForm.value.detailedAddress,
          longitude: parseFloat(newLocationForm.value.longitude),
          latitude: parseFloat(newLocationForm.value.latitude)
        }, { withCredentials: true });
        ElMessage.success('地点添加成功');
        addLocationDialogVisible.value = false;
        fetchLocations(); // 刷新地点列表
      } catch (error) {
        ElMessage.error(`添加地点失败: ${error.response?.data?.error || error.message || '未知错误'}`);
        console.error('Error adding location:', {
          message: error.message,
          response: error.response ? error.response.data : 'No response',
          status: error.response ? error.response.status : 'No status',
          config: error.config
        });
      }
    }
  });
};

const confirmRent = async () => {
  if (!rentFormRef.value) return;

  try {
    // 验证表单
    await rentFormRef.value.validate();

    // 确保日期和时间已选择
    if (!rentForm.value.startDate || !rentForm.value.startTime ||
        !rentForm.value.endDate || !rentForm.value.endTime) {
      ElMessage.error('请选择完整的日期和时间');
      return;
    }

    // 检查结束日期时间是否早于开始日期时间
    const startDateTime = new Date(`${rentForm.value.startDate} ${rentForm.value.startTime}`);
    const endDateTime = new Date(`${rentForm.value.endDate} ${rentForm.value.endTime}`);

    if (endDateTime < startDateTime) {
      ElMessage.error('结束日期时间不能早于开始日期时间');
      return;
    }

    // 调试日志：输出提交数据
    console.log('Submitting rent data:', {
      vehicleId: rentForm.value.vehicleId,
      startDate: rentForm.value.startDate,
      startTime: rentForm.value.startTime,
      endDate: rentForm.value.endDate,
      endTime: rentForm.value.endTime,
      locationId: rentForm.value.locationId,
      status: rentForm.value.status
    });

    // 提交租车请求
    const response = await axios.post('/api/vehicles/schedule', {
      vehicleId: rentForm.value.vehicleId,
      startDate: rentForm.value.startDate,
      startTime: rentForm.value.startTime,
      endDate: rentForm.value.endDate,
      endTime: rentForm.value.endTime,
      locationId: rentForm.value.locationId,
      status: rentForm.value.status
    }, { withCredentials: true });

    ElMessage.success('租车成功');
    rentDialogVisible.value = false;
    fetchVehicles(); // 刷新车辆列表
  } catch (error) {
    // 验证失败或API错误
    if (error.name !== 'Error') {
      ElMessage.error(`租车失败: ${error.response?.data?.error || error.message || '未知错误'}`);
      console.error('Error scheduling vehicle:', {
        message: error.message,
        response: error.response ? error.response.data : 'No response',
        status: error.response ? error.response.status : 'No status'
      });
    }
  }
};

// 禁用过去日期
const disabledDate = (date) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
};

onMounted(fetchVehicles);
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.vehicle-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.vehicle-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.vehicle-info {
  padding: 15px;
}

.vehicle-info h3 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.vehicle-info p {
  margin: 5px 0;
  color: #7f8c8d;
}
</style>