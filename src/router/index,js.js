import { createRouter, createWebHistory } from 'vue-router'
import MainDashboard from '../components/MainDashboard.vue'
import AdminPanel from '../components/AdminPanel.vue'

const routes = [
  { path: '/', component: MainDashboard },
  { path: '/admin', component: AdminPanel } // AdminPanel is only accessible via /admin
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router