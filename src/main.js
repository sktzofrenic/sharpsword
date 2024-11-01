import './assets/output.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

const worker = new Worker(new URL('./assets/js/service-worker.js', import.meta.url))

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
