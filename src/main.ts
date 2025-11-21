import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 使用 Pinia
app.use(createPinia())

// 使用 Ant Design Vue
app.use(Antd)

// 使用 Router
app.use(router)

app.mount('#app')
