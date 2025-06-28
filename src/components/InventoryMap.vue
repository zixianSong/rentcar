<template>
  <el-card style="height: 100vh;width: 100vw">
    <template #header>
      <span>库存地理分布</span>
    </template>
    <div id="map-container" class="map-container"></div>
  </el-card>
</template>

<script setup>
import { onMounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import axios from 'axios'
import { ElMessage } from 'element-plus'

let map = null

const formatDateTime = (date, time) => {
  if (!date || !time) return '无效时间'
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day} ${time.split('.')[0]}`
}

const loadMapAndMarkers = async () => {
  try {
    await AMapLoader.load({
      key: '126f152cac4814a314dc81bd36d25ead', // 替换为真实 Key
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.InfoWindow'],
    })

    map = new AMap.Map('map-container', {
      zoom: 5,
      center: [104.195397, 35.86166],
    })

    // 并发请求两个接口
    const [locationRes, inventoryRes] = await Promise.all([
      axios.get('/api/locations'),
      axios.get('/api/inventory'),
    ])

    const locations = locationRes.data
    const inventory = inventoryRes.data

    // 建立 location_id 到位置的映射
    const locationMap = {}
    locations.forEach(loc => {
      locationMap[loc.location_id] = loc
    })

    // 遍历库存，找到其位置并添加 Marker
    inventory.forEach(item => {
      const loc = locationMap[item.location_id]
      if (loc && loc.longitude && loc.latitude) {
        const position = [parseFloat(loc.longitude), parseFloat(loc.latitude)]
        const infoContent = `
          <div style="padding: 10px; font-size: 14px">
            <strong>地点：</strong>${loc.province || ''}${loc.city || ''}${loc.district || ''}<br/>
            <strong>车型：</strong>${item.model}<br/>
            <strong>状态：</strong>${item.status}<br/>
            <strong>有效时间：</strong><br/>
            ${formatDateTime(item.start_date, item.start_time)} ~<br/>
            ${formatDateTime(item.end_date, item.end_time)}
          </div>
        `

        const infoWindow = new AMap.InfoWindow({
          content: infoContent,
          offset: new AMap.Pixel(0, -30),
        })

        const marker = new AMap.Marker({
          position,
          map,
          title: item.model,
        })

        marker.on('click', () => {
          infoWindow.open(map, position)
        })
      }
    })
  } catch (err) {
    console.error('加载失败:', err)
    ElMessage.error('地图加载失败，请检查网络或接口')
  }
}

onMounted(() => {
  loadMapAndMarkers()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 64px);
}
</style>
