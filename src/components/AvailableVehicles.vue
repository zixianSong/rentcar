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
            <el-button type="primary" @click="rentVehicle(vehicle.vehicle_id)">立即租车</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-else description="暂无可用车辆" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { ElMessage, ElRow, ElCol, ElCard, ElButton, ElEmpty, ElCarousel, ElCarouselItem } from 'element-plus';

const vehicles = ref([]);

// 获取可用车辆
const fetchVehicles = async () => {
  try {
    const response = await axios.get('http://localhost:3000/available-vehicles');
    vehicles.value = Array.isArray(response.data) ? response.data : [];
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

const rentVehicle = (vehicleId) => {
  ElMessage.success(`车辆 ID ${vehicleId} 租车请求已提交`);
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