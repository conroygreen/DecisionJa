<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="card">
        <h2>Voter Turnout</h2>
        <div style="font-size: 48px; font-weight: 700;">{{ turnout }}%</div>
        <div style="font-size: 14px; color: #aaa;">{{ countedBoxes }} of {{ totalBoxes }} boxes</div>
      </div>

      <div class="card">
        <h2>Seats by Party</h2>
        <PartySeatsChart :seats-data="seatsData" />
        <div v-for="seat in seatsData" :key="seat.party" style="display: flex; align-items: center; margin-bottom: 8px;">
          <div :style="{ backgroundColor: seat.color, width: '16px', height: '16px', borderRadius: '50%', marginRight: '8px' }"></div>
          <span>{{ seat.party }}: {{ seat.count }}</span>
        </div>
      </div>

      <div class="card">
        <h2>Leading Leader</h2>
        <div :style="{
          fontSize: '32px',
          fontWeight: 600,
          color: partyColors[leadingParty] || '#00ff99',
          marginBottom: '8px'
        }">
          {{ leadingParty ? leadingParty.toUpperCase() : '—' }}
        </div>
        <div style="font-size: 18px; color: #fff;">{{ leadingVotes }} votes</div>
        <div style="font-size: 14px; color: #aaa; margin-top: 4px;">in {{ selectedConstituency.constituency || '—' }}</div>
      </div>
    </aside>

    <main class="main-content">
      <header style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1>Decision 2025 <span style="color: #00ff99;">Live</span></h1>
          <span v-if="selectedConstituency.constituency" style="margin-left: 16px; font-size: 18px;">
            {{ selectedConstituency.constituency }}
          </span>
        </div>
        <div>
          <select><option>2024</option></select>
          <span style="margin-left: 16px; color: #00ff99;">● Live</span>
        </div>
      </header>

      <section style="display: flex; gap: 24px; margin-top: 24px;">
        <div style="flex: 2;">
          <div class="card">
            <ConstituencyMap
              :constituencies="constituencies"
              :selected-constituency="selectedConstituency"
              :party-colors="partyColors"
              @select-constituency="handleConstituencySelect"
            />
          </div>
        </div>

        <div style="flex: 1;">
          <div class="card">
            <h2>Constituency Details</h2>
            <div v-if="selectedConstituency.results?.length">
              <table>
                <thead><tr><th>Party</th><th>Votes</th></tr></thead>
                <tbody>
                  <tr v-for="r in selectedConstituency.results" :key="r.candidate_id">
                    <td>{{ r.candidate_id?.toUpperCase() }}</td>
                    <td>{{ r.votes }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else>No data</div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <a href="/admin" class="admin-link">Admin Login</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { db } from '../firebase/firebase.js'
import { collection, onSnapshot } from 'firebase/firestore'
import PartySeatsChart from './PartySeatsChart.vue'
import ConstituencyMap from './ConstituencyMap.vue'

const partyColors = {
  pnp: "#ff6600",
  jlp: "#009900",
  uic: "#6a1b9a",
  indp: "#888"
}

const constituencies = ref([])
const loading = ref(true)
const currentIndex = ref(0)

let unsubscribe = null

onMounted(() => {
  unsubscribe = onSnapshot(collection(db, "constituencies"), (querySnapshot) => {
    const data = []
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() })
    })
    constituencies.value = data
    loading.value = false
  })

  watch(constituencies, () => {
    if (constituencies.value.length) {
      setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % constituencies.value.length
      }, 30000)
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const selectedConstituency = computed(() => constituencies.value[currentIndex.value] || {})

const totalVoters = computed(() => constituencies.value.reduce((sum, c) => sum + (c.registered_voters || 0), 0))
const totalBoxes = computed(() => constituencies.value.reduce((sum, c) => sum + (c.boxes_total || 0), 0))
const countedBoxes = computed(() => constituencies.value.reduce((sum, c) => sum + (c.boxes_counted || 0), 0))
const turnout = computed(() => totalBoxes.value ? Math.round((countedBoxes.value / totalBoxes.value) * 100) : 0)

const seatsData = computed(() => {
  const seats = {}
  constituencies.value.forEach(c => {
    if (Array.isArray(c.results) && c.results.length) {
      const sorted = [...c.results].sort((a, b) => (b.votes || 0) - (a.votes || 0))
      const leader = sorted[0]?.candidate_id
      if (leader) seats[leader] = (seats[leader] || 0) + 1
    }
  })
  return Object.entries(seats).map(([party, count]) => ({ party, count, color: partyColors[party] || "#333" }))
})

const leadingParty = computed(() => {
  const res = selectedConstituency.value.results
  if (Array.isArray(res) && res.length) {
    return res.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.candidate_id || ''
  }
  return ''
})

const leadingVotes = computed(() => {
  const res = selectedConstituency.value.results
  if (Array.isArray(res) && res.length) {
    return res.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.votes || 0
  }
  return 0
})

const leaderData = computed(() => {
  let leaderName = ''
  let leaderVotes = 0
  let leaderParty = ''
  constituencies.value.forEach(c => {
    c.results?.forEach(r => {
      if (r.votes > leaderVotes) {
        leaderVotes = r.votes
        leaderParty = r.candidate_id
        leaderName = (r.candidate_name || r.candidate_id || '').toUpperCase()
      }
    })
  })
  return { leaderName, leaderVotes, leaderParty }
})

const leaderName = computed(() => leaderData.value.leaderName)
const leaderVotes = computed(() => leaderData.value.leaderVotes)
const leaderParty = computed(() => leaderData.value.leaderParty)

const handleConstituencySelect = (constituency) => {
  const index = constituencies.value.findIndex(c => c.id === constituency.id)
  if (index !== -1) {
    currentIndex.value = index
  }
}
</script>

<style scoped>
/* General Layout */
.dashboard-container {
  display: flex;
  background-color: #F5F7FA; /* App Background */
  color: #212121; /* Primary Text */
  font-family: 'Roboto', 'Inter', sans-serif;
  height: 100vh;
}

.sidebar {
  width: 300px;
  background-color: #3E4C59; /* Sidebar */
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background-color: #FFFFFF; /* Panels / Cards */
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Cards / Panels Shadow */
  border: 1px solid #E0E0E0; /* Dividers / Light Border */
}

.card h2 {
  font-size: 20px; /* Section Title */
  font-weight: 600; /* Semi-Bold */
  color: #212121; /* Primary Text */
  margin-bottom: 8px;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); /* Hovered Panel Shadow */
  background-color: #EDEFF1; /* Hover Background */
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

/* Sidebar Content */
.sidebar .card div {
  font-size: 16px; /* Body Text */
  color: #555555; /* Secondary Text */
}

.sidebar .card div span {
  font-size: 14px; /* Label Text */
  color: #888888; /* Muted Text */
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2F3E46; /* Header / Top Nav */
  padding: 16px;
  border-radius: 8px;
  color: #FFFFFF; /* Text Color */
}

header h1 {
  font-size: 24px; /* Headline */
  font-weight: bold;
}

header select {
  background-color: #607D8B; /* Secondary Button BG */
  color: #FFFFFF; /* Text Color */
  border: none;
  padding: 8px;
  border-radius: 4px;
}

header select:focus {
  outline: none;
}

header span {
  color: #FFCC66; /* Accent Highlight */
  font-weight: bold;
}

/* Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

table th, table td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #C9CED6; /* Divider Line */
}

table th {
  font-size: 14px; /* Label Text */
  font-weight: 600; /* Medium */
  color: #212121; /* Primary Text */
}

table td {
  font-size: 16px; /* Body Text */
  color: #555555; /* Secondary Text */
}

table tr:hover {
  background-color: #EDEFF1; /* Hover Background */
}

/* Party Colors */
.party-color-pnp {
  background-color: #FF6600; /* PNP */
}

.party-color-jlp {
  background-color: #00A550; /* JLP */
}

.party-color-other {
  background-color: #7B7B7B; /* Other / Independent */
}

/* Map Placeholder */
.map-placeholder {
  background-color: #F5F7FA; /* Map Background */
  border: 1px solid #C9CED6; /* Constituency Borders */
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888888; /* Muted Text */
  font-size: 16px;
}

/* Buttons */
button {
  background-color: #4B5D67; /* Primary Button BG */
  color: #FFFFFF; /* Text Color */
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3E4C59; /* Darker Shade */
  transition: background-color 0.2s ease;
}

/* Footer */
.footer {
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  background-color: #3E4C59; /* Sidebar color for consistency */
  color: #FFFFFF;
}

.admin-link {
  color: #FFCC66; /* Accent Highlight */
  text-decoration: none;
  font-weight: bold;
}

.admin-link:hover {
  text-decoration: underline;
}
</style>