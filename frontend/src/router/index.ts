import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
//import store from '@/main'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/home',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView,
        },
        {
            path: '/profile',
            name: 'profile',
            component: AboutView,
        },
        {
            path: '/search',
            name: 'search',
            component: AboutView,
        },
        {
            path: '/login',
            name: 'login',
            component: AboutView,
        },
        /*{
            path: '/register',
            name: 'register',
            component: RegisterView,
        },*/
    ],
})

export default router
