import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { provideApolloClient } from '@vue/apollo-composable';
import apolloClient from './apollo';

const app = createApp(App)

app.use(router)

app.mount('#app')

// Provide Apollo Client to the app
provideApolloClient(apolloClient);