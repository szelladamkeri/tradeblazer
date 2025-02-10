import { createRouter, createWebHistory } from 'vue-router'
import { default as Home } from '../views/HomeView.vue'
import { default as About } from '../views/AboutView.vue'
import { default as Profile } from '../views/ProfileView.vue'
import { default as Login } from '../views/LoginView.vue'
import { default as NotFound } from '../views/NotFoundView.vue'
//import store from '@/main'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            //Lehetne valamilyen propertyje egy viewnek ami megmondana a frontnednek hogy navbart kapjon plusz esetleg egy icon mert a homenak akarunk
            path: '/',
            name: 'home',
            component: Home,
            meta:{
                //navbar: true,
            },
        },
        {
            path: '/about',
            name: 'about',
            component: About,
        },
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
            meta:{
                //navbar: true,
                requiresAuth: true,
            },
        },
        {
            path: '/search',
            name: 'search',
            component: About,
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: NotFound
        }
        /*{
            path: '/register',
            name: 'register',
            component: RegisterView,
        },*/
    ],
})

export default router
