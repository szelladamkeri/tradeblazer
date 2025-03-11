import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import {
  faChartLine,
  faChartPie,
  faHome,
  faInfo,
  faUser,
  faRightFromBracket as faSignOut,
  faRightToBracket as faSignIn,
  faEdit,
  faDollarSign,
  faFire,
  faCoins,
  faBars,
  faXmark,
  faUserCircle,
  faWallet,
  faShield,
  faUsers,
  faTag as faUserTag,
  faEnvelope,
  faTrash,
  faHashtag,
  faWrench,
  faPen as faUserPen,
  faCheck,
  faTriangleExclamation,
  faCircleCheck
} from '@fortawesome/free-solid-svg-icons'

// Add the entire solid icon pack first to ensure all icons are available
library.add(fas)

// Then add specific icons for explicit usage
library.add(
  faHome,
  faInfo,
  faUser,
  faSignIn,
  faSignOut,
  faEdit,
  faChartLine,
  faDollarSign,
  faFire,
  faCoins,
  faBars,
  faXmark,
  faChartPie,
  faUserCircle,
  faWallet,
  faShield,
  faUsers,
  faUserTag,
  faEnvelope,
  faTrash,
  faHashtag,
  faWrench,
  faUserPen,
  faCheck,
  faTriangleExclamation,
  faCircleCheck
)

export { FontAwesomeIcon }
