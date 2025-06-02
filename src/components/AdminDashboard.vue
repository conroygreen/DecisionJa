<template>
  <div class="admin-container">
    <h1>Admin Panel - Update Constituencies</h1>
    <div v-if="loading">Loading data...</div>
    <div v-else>
      <div v-for="item in constituencies" :key="item.id" class="admin-card">
        <h2>{{ item.constituency }} ({{ item.parish }})</h2>
        <div>
          <label>Boxes Counted:</label>
          <input type="number" v-model.number="item.boxes_counted" />
        </div>
        <div style="margin-top: 8px;">
          <button @click="saveUpdate(item)">Save Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/firebase.js'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

const constituencies = ref([])
const loading = ref(true)

async function fetchData() {
  try {
    const querySnapshot = await getDocs(collection(db, "constituencies"))
    const data = []
    querySnapshot.forEach((docItem) => {
      data.push({ id: docItem.id, ...docItem.data() })
    })
    constituencies.value = data
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    loading.value = false
  }
}

async function saveUpdate(item) {
  try {
    const docRef = doc(db, "constituencies", item.id)
    await updateDoc(docRef, { boxes_counted: item.boxes_counted })
    alert("Updated successfully!")
  } catch (error) {
    console.error("Error updating document:", error)
    alert("Update failed!")
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-container {
  padding: 24px;
}
.admin-card {
  border: 1px solid #ccc;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
}
</style>