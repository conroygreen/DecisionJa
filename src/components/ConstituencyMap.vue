<template>
  <div class="map-container">
    <l-map ref="map" v-model:zoom="zoom" :center="center" :options="mapOptions">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />
      <l-geo-json
        ref="geoJsonLayer"
        v-if="geoJsonData"
        :geojson="geoJsonData"
        :options="geoJsonOptions"
        @click="handleConstituencyClick"
      />
    </l-map>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'

const props = defineProps({
  constituencies: Array,
  selectedConstituency: Object,
  partyColors: Object
})

const emit = defineEmits(['select-constituency'])

const map = ref(null)
const geoJsonLayer = ref(null)
const zoom = ref(8)
const center = ref([18.1096, -77.2975])
const geoJsonData = ref(null)

const mapOptions = { zoomControl: true, scrollWheelZoom: true }

const geoJsonOptions = {
  style: styleFeature,
  onEachFeature: (feature, layer) => {
    layer.bindTooltip(feature.properties.name, { permanent: false, direction: 'center' })
  }
}

function styleFeature(feature) {
  const constituency = props.constituencies.find(c => c.constituency === feature.properties.name)
  if (!constituency?.results?.length) {
    return { fillColor: '#CCCCCC', weight: 2, opacity: 1, color: '#666', fillOpacity: 0.7 }
  }
  const sorted = [...constituency.results].sort((a, b) => b.votes - a.votes)
  const leadingParty = sorted[0]?.candidate_id
  const isSelected = props.selectedConstituency?.constituency === constituency.constituency
  return {
    fillColor: props.partyColors[leadingParty] || '#CCCCCC',
    weight: 2, opacity: 1, color: '#666', fillOpacity: isSelected ? 0.9 : 0.7
  }
}

const handleConstituencyClick = (event) => {
  const constituencyName = event.sourceTarget.feature.properties.name
  const constituency = props.constituencies.find(c => c.constituency === constituencyName)
  if (constituency) {
    emit('select-constituency', constituency)
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/ConstituencyBoundryOutline.geojson')
    geoJsonData.value = await response.json()
  } catch (error) {
    console.error('Failed to load map data:', error)
  }
})

// 🔥 Watch for external prop changes to force style updates
watch(
  () => [props.constituencies, props.selectedConstituency],
  () => {
    if (geoJsonLayer.value) {
      geoJsonLayer.value.leafletObject.setStyle(styleFeature)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
