import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import EditProfileView from '../views/EditProfileView.vue'
import NotFoundView from '../views/NotFoundView.vue'
//import store from '@/main'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      //Lehetne valamilyen propertyje egy viewnek ami megmondana a frontnednek hogy navbart kapjon plusz esetleg egy icon mert a homenak akarunk
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        navbar: true,
      },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        navbar: true,
        requiresAuth: true,
      },
    },
    {
      path: '/search',
      name: 'search',
      component: AboutView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/edit-profile',
      name: 'editProfile',
      component: EditProfileView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/404',
      name: 'not-found',
      component: NotFoundView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

// Navigation guard (404)
router.beforeEach((to, from, next) => {
  if (to.matched.length === 0) {
    next('/404')
  } else {
    next()
  }
})

export default router
