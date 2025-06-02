<template>
  <div>
    <MainDashboard />
    <div v-if="!user" style="margin-top: 24px;">
      <Login />
    </div>
    <div v-if="user">
      <AdminDashboard />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth } from './firebase/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import Login from './components/Login.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import MainDashboard from './components/MainDashboard.vue'

const user = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
})
</script>