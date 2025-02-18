import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'

/* Import FontAwesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* Import icons */
import {
  faUserSlash,
  faShield,
  faUsers,
  faHashtag,
  faUser,
  faEnvelope,
  faUserTag,
  faWrench,
  faUserCircle,
  faEdit,
  faTrash,
  faPen,
} from '@fortawesome/free-solid-svg-icons'

/* Add icons to the library */
library.add(
  faUserSlash,
  faShield,
  faUsers,
  faHashtag,
  faUser,
  faEnvelope,
  faUserTag,
  faWrench,
  faUserCircle,
  faEdit,
  faTrash,
  faPen,
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
