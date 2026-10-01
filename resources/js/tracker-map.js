import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Tracker live map — initialises a Leaflet map on the element
 * #tracker-map if it exists on the page.
 * lat/lng are embedded as data attributes by the Edge template.
 */
document.addEventListener('DOMContentLoaded', function () {
  const el = document.getElementById('tracker-map')
  if (!el) return

  const lat = parseFloat(el.dataset.lat ?? '0')
  const lng = parseFloat(el.dataset.lng ?? '0')
  if (!lat || !lng) return

  const map = L.map(el, { zoomControl: true, attributionControl: true })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  map.setView([lat, lng], 16)

  const icon = L.divIcon({
    className: '',
    html: '<div class="map-marker-pin"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

  L.marker([lat, lng], { icon }).addTo(map)

  // Force a size recalculation in case the container wasn't fully laid out yet
  setTimeout(() => map.invalidateSize(), 100)
})
