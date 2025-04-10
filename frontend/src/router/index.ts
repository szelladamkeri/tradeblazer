import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/edit-profile',
      name: 'editProfile',
      component: () => import('../views/EditProfileView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/trade/:id',
      name: 'trade',
      component: () => import('../views/TradeView.vue'),
      props: true
    },
    {
      path: '/markets',
      name: 'markets',
      component: () => import('../views/MarketsView.vue')
    },
    {
      path: '/markets/:id',
      name: 'asset-details',
      component: () => import('../views/MarketsView.vue'),
      props: true
    },
    {
      path: '/tutorial',
      name: 'tutorial',
      component: () => import('../views/TutorialView.vue'),
      props: true
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('../views/VerifyView.vue'),
    },
  ]
})

// Add navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
    return
  }

  // Check if route requires admin privileges
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    return
  }

  if (to.matched.length === 0) {
    next('/404')
  } else {
    next()
  }
})

export default router