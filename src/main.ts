import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { store } from './store'
import { useUserStore } from './store/modules/user'

const app = createApp(App)

// Use Pinia Store
app.use(store)

// Initialize page permissions on app startup (after store is registered)
const userStore = useUserStore(store)
userStore.initPagePermissions()

// Use Ant Design Vue
app.use(Antd)

// Use Router
app.use(router)

app.mount('#app')
