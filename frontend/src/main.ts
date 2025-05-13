import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'
import i18n from './i18n'

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
  faLanguage,
  faFlag,
  faChevronCircleDown,
  faChevronDown,
  faList,
  faTimesCircle,
  faSpinner,
  faArrowRight,
  faBell,
  faMoneyBillTransfer,
  faBuildingColumns,
  faCreditCard,
  faSync,
  faBolt,
  faSearchDollar,
  faMoneyBillWave,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons'
import { faPaypal, faBitcoin } from '@fortawesome/free-brands-svg-icons'; // Removed faSkrill/faMoneyCheckDollar

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
  faLanguage,
  faFlag,
  faChevronCircleDown,
  faChevronDown,
  faList,
  faTimesCircle,
  faSpinner,
  faArrowRight,
  faBell,
  faMoneyBillTransfer,
  faBuildingColumns,
  faCreditCard,
  faPaypal,
  faBitcoin,
  faSync,
  faBolt,
  faSearchDollar,
  faMoneyBillWave,
  faCircleInfo
)

const app = createApp(App)
const pinia = createPinia()

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(pinia)
app.use(router)
app.use(i18n)

const userStore = useUserStore()
userStore.initializeFromStorage()

app.mount('#app')
