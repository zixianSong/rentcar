import { createRouter, createWebHistory } from 'vue-router'

// 使用懒加载方式导入组件
const Echartstest = () => import('@/components/Echartstest.vue')
const AvailableVehicles = () => import('@/components/AvailableVehicles.vue')
const routes = [
    {
        path: '/test',
        name: 'Echartstest',
        component: Echartstest
    },
    {
        path: '/vehicles',
        name: 'AvailableVehicles',
        component: AvailableVehicles
    }
]

const router = createRouter({
    // 使用根路径作为基础URL
    history: createWebHistory('/'),
    routes
})

export default router