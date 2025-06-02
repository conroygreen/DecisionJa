<template>
  <div class="login-container">
    <h1>Admin Login</h1>
    <form @submit.prevent="login">
      <div>
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/firebase.js'

const email = ref('')
const password = ref('')

async function login() {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    alert("Login successful!")
  } catch (error) {
    console.error("Login error:", error)
    alert("Invalid credentials")
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>