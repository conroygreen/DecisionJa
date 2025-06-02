<template>
  <div class="admin-container">
    <h1>Admin Panel</h1>
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search constituencies..."
      style="margin-bottom: 16px; padding: 8px; width: 100%;"
    />
    <div v-if="filteredConstituencies.length">
      <h2>Edit Constituency Data</h2>
      <div
        v-for="constituency in filteredConstituencies"
        :key="constituency.id"
        class="constituency-card"
      >
        <h3>{{ constituency.constituency }}</h3>
        <form @submit.prevent="updateConstituency(constituency.id)">
          <label>
            Registered Voters:
            <input
              type="number"
              v-model.number="constituency.registered_voters"
              required
            />
          </label>
          <label>
            Total Boxes:
            <input
              type="number"
              v-model.number="constituency.boxes_total"
              required
            />
          </label>
          <label>
            Boxes Counted:
            <input
              type="number"
              v-model.number="constituency.boxes_counted"
              required
            />
          </label>
          <label>
            Results:
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in constituency.results" :key="result.candidate_id">
                  <td>{{ result.candidate_name || result.candidate_id }}</td>
                  <td>
                    <input
                      type="number"
                      v-model.number="result.votes"
                      required
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </label>
          <button type="submit" :disabled="isUpdating">
            {{ isUpdating ? 'Updating...' : 'Save Changes' }}
          </button>
        </form>
      </div>
    </div>
    <div v-else>
      <p>Loading constituency data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase/firebase.js'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

const constituencies = ref([])
const isUpdating = ref(false)
const searchQuery = ref('')

// Fetch constituency data
const fetchConstituencies = async () => {
  const querySnapshot = await getDocs(collection(db, 'constituencies'))
  constituencies.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Update constituency data
const updateConstituency = async (id) => {
  const constituency = constituencies.value.find(c => c.id === id)
  if (constituency) {
    const confirmUpdate = confirm('Are you sure you want to save these changes?')
    if (!confirmUpdate) return

    try {
      const docRef = doc(db, 'constituencies', id)
      await updateDoc(docRef, {
        registered_voters: constituency.registered_voters,
        boxes_total: constituency.boxes_total,
        boxes_counted: constituency.boxes_counted,
        results: constituency.results
      })
      alert('Constituency updated successfully!')
    } catch (error) {
      alert('Failed to update constituency. Please try again.')
    }
  }
}

const filteredConstituencies = computed(() => {
  return constituencies.value.filter(c =>
    c.constituency.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(fetchConstituencies)
</script>

<style scoped>
.admin-container {
  padding: 24px;
  background-color: #F5F7FA;
  color: #212121;
  font-family: 'Roboto', sans-serif;
}

.constituency-card {
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #555555;
}

input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #C9CED6;
  border-radius: 4px;
}

button {
  background-color: #4B5D67;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3E4C59;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

table th, table td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #C9CED6;
}

table th {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
}

table td input {
  width: 100%;
  padding: 4px;
  font-size: 14px;
  border: 1px solid #C9CED6;
  border-radius: 4px;
}
</style>