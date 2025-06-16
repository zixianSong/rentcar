import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 导入路由配置
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as echarts from 'echarts'
import './assets/main.css'; // 导入全局样式
// 创建应用实例
const app = createApp(App)

// 使用 Element Plus
app.use(ElementPlus)

// 将 ECharts 挂载到全局属性
app.config.globalProperties.$echarts = echarts
// 使用路由
app.use(router)

app.mount('#app')