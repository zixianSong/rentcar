// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '../components/HelloWorld.vue';
import AvailableVehicles from '../components/AvailableVehicles.vue';
import VehicleSchedule from '../components/VehicleSchedule.vue';
import Dashboard from '../components/Dashboard.vue';
import VehicleAnalysis from '../components/VehicleAnalysis.vue';
import VehicleForm from '../components/OrderStats.vue';
import OrderList from '../components/OrderList.vue';
import OrderStats from "@/components/OrderStats.vue";
import CurrentInventory from "@/components/CurrentInventory.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HelloWorld,
        redirect: '/available_vehicles',
        children: [
            { path: 'dashboard', component: Dashboard, name: 'Dashboard' },
            { path: 'vehicle_analysis', component: VehicleAnalysis, name: 'VehicleList' },
            { path: 'vehicles/add', component: VehicleForm, name: 'VehicleAdd' },
            { path: 'vehicles/:id', component: VehicleForm, name: 'VehicleEdit' },
            { path: 'orders', component: OrderList, name: 'OrderList' },
            { path: 'available_vehicles', component: AvailableVehicles, name: 'AvailableVehicles' },
            { path: 'schedule', name: 'Schedule', component: VehicleSchedule},
            { path: 'order-stats', name: 'OrderStats', component: OrderStats},
            { path: 'current_inventory', name: 'CurrentInventory', component: CurrentInventory},

        ]
    },
    {
        path: '/vehicles',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;