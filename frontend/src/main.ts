import { createPinia } from 'pinia'
import { createApp } from 'vue'

import PrimeVue from 'primevue/config';
import Lara from '@/presets/lara';

import App from '@/App.vue'
import '@/assets/main.css'
import router from '@/router'

const app = createApp(App)

app.use(PrimeVue, {
    unstyled: true,
    pt: Lara
});

app.use(createPinia())
app.use(router)

app.mount('#app')
