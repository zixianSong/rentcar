<template>
  <div class="container">
    <h1>可用车辆</h1>
    <el-row :gutter="20" v-if="uniqueVehicles.length">
      <el-col :span="8" v-for="vehicle in uniqueVehicles" :key="vehicle.vehicle_id">
        <el-card class="vehicle-card" shadow="hover">
          <el-carousel height="200px" v-if="vehicle.imageUrls && vehicle.imageUrls.length">
            <el-carousel-item v-for="imageUrl in vehicle.imageUrls" :key="imageUrl">
              <img :src="getImageUrl(imageUrl)" alt="Vehicle" class="vehicle-image" @error="handleImageError" />
            </el-carousel-item>
          </el-carousel>
          <img v-else :src="getImageUrl('/assets/HondaCivic.jpeg')" alt="Vehicle" class="vehicle-image" @error="handleImageError" />
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
    const response = await axios.get('http://localhost:3000/api/available-vehicles', {
      params: {
        startDate: '2025-06-16',
        endDate: '2025-06-20'
      }
    });
    vehicles.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    ElMessage.error(`获取车辆信息失败: ${error.message}`);
    console.error('Error fetching vehicles:', error);
    vehicles.value = [];
  }
};

// 去重并聚合图片
const uniqueVehicles = computed(() => {
  if (!Array.isArray(vehicles.value)) return [];
  const seen = new Map();
  vehicles.value.forEach(item => {
    if (!seen.has(item.vehicle_id)) {
      seen.set(item.vehicle_id, {
        ...item,
        imageUrls: []
      });
    }
    if (item.image_url) {
      seen.get(item.vehicle_id).imageUrls.push(normalizeImageUrl(item.image_url));
    }
  });
  return Array.from(seen.values());
});

// 规范化图片路径
const normalizeImageUrl = (url) => {
  if (!url) return null;
  // 处理 ../assets/ 或 /assets/，移除 ../ 前缀并规范化
  return url.replace(/^(\.\.\/|\/)?assets\//, '/src/assets/').replace(/ /g, ''); // 移除空格
};

// 图片路径处理
const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300';
  try {
    const normalizedUrl = normalizeImageUrl(url);
    return new URL(normalizedUrl, import.meta.url).href;
  } catch (e) {
    console.warn('Image not found:', url, e);
    return 'https://via.placeholder.com/300';
  }
};

const handleImageError = (event) => {
  event.target.src = '/src/assets/HondaCivic.jpeg'; // 使用本地默认图
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