import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import EditProfileView from '../views/EditProfileView.vue'
import MarketsView from '../views/MarketsView.vue'
import PortfolioView from '../views/PortfolioView.vue'
import TradeView from '../views/TradeView.vue'
import AdminView from '../views/AdminView.vue'
import TutorialView from '../views/TutorialView.vue'
import DepositView from '@/views/DepositView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import WithdrawView from '@/views/WithdrawView.vue'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
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
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/edit-profile',
      name: 'editProfile',
      component: EditProfileView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/404',
      name: 'not-found',
      component: NotFoundView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/trade/:id',
      name: 'trade',
      component: TradeView,
      props: true
    },
    {
      path: '/markets',
      name: 'markets',
      component: MarketsView
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
    {
      path: '/deposit',
      name: 'deposit',
      component: DepositView,
      meta: { requiresAuth: true }
    },
    {
      path: '/withdraw',
      name: 'withdraw',
      component: WithdrawView,
      meta: { requiresAuth: true }
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