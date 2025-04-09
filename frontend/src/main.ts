import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'

/* Import FontAwesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* Import specific icons */
import {
  faChartLine,
  faChartPie,
  faFire,
  faCoins,
  faBars,
  faXmark,
  faWallet,
  faWrench,
  faUserCircle,
  faShield,
  faUserPen,
  faEdit,
  faTrash,
  faUserSlash,
  faRightFromBracket,
  faRightToBracket,
  faUsers,
  faHashtag,
  faUser,
  faEnvelope,
  faUserTag,
  faHome,
  faInfo,
  faSearch,
  faStar,
  faExchangeAlt,
  faTriangleExclamation,
  faGraduationCap,
  faPlay,
  faBook,
  faTools,
  faBriefcase,
  faMagnifyingGlassChart,
  faLayerGroup,
  faCaretUp,
  faCaretDown,
  faSackDollar,
  faDollarSign,
  faQuestion,
  faChevronLeft,
  faChevronRight,
  faRotate,
  faServer,
  faLock,
  faCircleArrowUp,
  faCircleArrowDown,
  faLaptop,
  faCompass,
  faCircleQuestion,
  faComments,
  faScaleBalanced,
  faListCheck,
  faCalendarDays,
  faLifeRing,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons'

/* Add icons to the library */
library.add(
  faChartLine,
  faChartPie,
  faFire,
  faCoins,
  faBars,
  faXmark,
  faWallet,
  faWrench,
  faUserCircle,
  faShield,
  faUserPen,
  faEdit,
  faTrash,
  faUserSlash,
  faRightFromBracket,
  faRightToBracket,
  faUsers,
  faHashtag,
  faUser,
  faEnvelope,
  faUserTag,
  faHome,
  faInfo,
  faSearch,
  faStar,
  faExchangeAlt,
  faTriangleExclamation,
  faGraduationCap,
  faPlay,
  faBook,
  faTools,
  faBriefcase,
  faMagnifyingGlassChart,
  faLayerGroup,
  faCaretUp,
  faCaretDown,
  faSackDollar,
  faDollarSign,
  faQuestion,
  faChevronLeft,
  faChevronRight,
  faRotate,
  faServer,
  faLock,
  faCircleArrowUp,
  faCircleArrowDown,
  faLaptop,
  faCompass,
  faCircleQuestion,
  faComments,
  faScaleBalanced,
  faListCheck,
  faCalendarDays,
  faLifeRing,
  faBuilding,
)

const app = createApp(App)
const pinia = createPinia()

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(pinia)
app.use(router)

const userStore = useUserStore()
userStore.initializeFromStorage()

app.mount('#app')
