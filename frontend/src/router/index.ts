import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    //itt kene osszerakni hogy a headert is csak itt-ott rakja be pl a loginnal nem
    //de amugy meg minden oldalra berakja, es azokon belul meg a megfelelo oldalt
    routes: [
        {
            path: '/home',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            //component: () => import('../views/AboutView.vue'),
            component: AboutView,
        },
    ],
})

export default router
