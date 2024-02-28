import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
})

import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/main.css'

const app = createApp(App)

app.use(vuetify)
app.mount('#app')
