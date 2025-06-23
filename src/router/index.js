// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '../components/HelloWorld.vue';
import AvailableVehicles from '../components/AvailableVehicles.vue';
import VehicleSchedule from '../components/VehicleSchedule.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HelloWorld,
        children: [
            {
                path: '',
                name: 'Vehicles',
                component: AvailableVehicles
            },
            {
                path: 'schedule',
                name: 'Schedule',
                component: VehicleSchedule
            }
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