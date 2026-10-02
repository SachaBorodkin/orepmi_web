import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * 45 minutes throttling interval for offline notifications (in milliseconds)
 */
const OFFLINE_ALERT_INTERVAL_MS = 45 * 60 * 1000

/**
 * Formats a number to 2 decimal places to observe changes at the 2nd digit after comma.
 */
function formatToTwoDecimals(val) {
  if (typeof val !== 'number' || isNaN(val)) return ''
  return val.toFixed(2)
}

/**
 * Checks if the second number after comma (hundredths) has changed between two coordinates.
 */
function hasMovedSecondDecimal(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return false
  return (
    formatToTwoDecimals(lat1) !== formatToTwoDecimals(lat2) ||
    formatToTwoDecimals(lng1) !== formatToTwoDecimals(lng2)
  )
}

/**
 * Displays a visual alert banner inside #tracker-alerts-container.
 */
function showAlertBanner(type, message) {
  const container = document.getElementById('tracker-alerts-container')
  if (!container) return

  // Prevent duplicate banners with the same message
  const msgKey = encodeURIComponent(message)
  const existing = container.querySelector(`[data-message="${msgKey}"]`)
  if (existing) return

  const banner = document.createElement('div')
  banner.className = `tracker-alert-banner ${type}`
  banner.setAttribute('data-message', msgKey)

  const textSpan = document.createElement('span')
  textSpan.textContent = message
  banner.appendChild(textSpan)

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'tracker-alert-close'
  closeBtn.innerHTML = '&times;'
  closeBtn.setAttribute('aria-label', 'Fermer')
  closeBtn.onclick = () => banner.remove()
  banner.appendChild(closeBtn)

  container.prepend(banner)

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    if (banner.parentNode) {
      banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
      banner.style.opacity = '0'
      banner.style.transform = 'translateY(-4px)'
      setTimeout(() => banner.remove(), 300)
    }
  }, 15000)
}

/**
 * Sends both a visual banner and a browser desktop notification.
 */
function sendAlert({ type, title, message }) {
  showAlertBanner(type, message)

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: message,
        icon: '/assets/images/logos/logo_without_name.png',
      })
    } catch {
      // Fallback silently if browser restricts notification
    }
  }
}

/**
 * Initializes browser notification permission handling.
 */
function setupNotificationPermissions() {
  const promptBtn = document.getElementById('btn-enable-notifications')
  if (!('Notification' in window)) {
    if (promptBtn) promptBtn.style.display = 'none'
    return
  }

  function updateBtn() {
    if (!promptBtn) return
    if (Notification.permission === 'default') {
      promptBtn.style.display = 'inline-flex'
    } else {
      promptBtn.style.display = 'none'
    }
  }

  updateBtn()

  if (promptBtn) {
    promptBtn.addEventListener('click', async () => {
      try {
        const perm = await Notification.requestPermission()
        updateBtn()
        if (perm === 'granted') {
          showAlertBanner('info', 'Notifications du navigateur activées pour le tracker.')
        }
      } catch {
        updateBtn()
      }
    })
  }
}

/**
 * Main Tracker live map controller.
 */
document.addEventListener('DOMContentLoaded', function () {
  const el = document.getElementById('tracker-map')
  if (!el) return

  setupNotificationPermissions()

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

  const marker = L.marker([lat, lng], { icon }).addTo(map)

  // Force size recalculation in case container layout wasn't immediate
  setTimeout(() => map.invalidateSize(), 100)

  // Track latest GPS timestamp
  const initialTimeStr = el.dataset.createdAt
  let lastDataTimestamp = initialTimeStr ? new Date(initialTimeStr).getTime() : 0

  const statusEl = document.getElementById('tracker-status')
  const speedEl = document.getElementById('tracker-speed')
  const dateEl = document.getElementById('tracker-added-date')
  const mapsLink = document.getElementById('tracker-maps-link')

  /**
   * Checks if tracker is offline and triggers notification at most once every 45 min.
   */
  function checkOfflineAlert(isOnline) {
    if (isOnline) return

    const now = Date.now()
    const lastAlertStr = localStorage.getItem('orepmi_last_offline_alert_ts')
    const lastAlert = lastAlertStr ? parseInt(lastAlertStr, 10) : 0

    if (now - lastAlert >= OFFLINE_ALERT_INTERVAL_MS) {
      localStorage.setItem('orepmi_last_offline_alert_ts', String(now))
      sendAlert({
        type: 'warning',
        title: 'Tracker Orepmi - Hors ligne',
        message: '⚠️ Tracker hors ligne : aucun signal GPS depuis plus de 30 secondes.',
      })
    }
  }

  /**
   * Checks if position moved (2nd number after comma changed) and triggers notification.
   */
  function checkMovementAlert(currentLat, currentLng) {
    if (typeof currentLat !== 'number' || typeof currentLng !== 'number' || isNaN(currentLat) || isNaN(currentLng)) {
      return
    }

    const prevLatStr = localStorage.getItem('orepmi_ref_lat')
    const prevLngStr = localStorage.getItem('orepmi_ref_lng')

    if (prevLatStr === null || prevLngStr === null) {
      // Initialize reference point without triggering false initial alert
      localStorage.setItem('orepmi_ref_lat', String(currentLat))
      localStorage.setItem('orepmi_ref_lng', String(currentLng))
      return
    }

    const prevLat = parseFloat(prevLatStr)
    const prevLng = parseFloat(prevLngStr)

    if (hasMovedSecondDecimal(prevLat, prevLng, currentLat, currentLng)) {
      localStorage.setItem('orepmi_ref_lat', String(currentLat))
      localStorage.setItem('orepmi_ref_lng', String(currentLng))

      sendAlert({
        type: 'danger',
        title: 'Tracker Orepmi - Mouvement détecté',
        message: `🚨 Mouvement détecté : nouvelle position (${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}).`,
      })
    }
  }

  // Check initial coordinates against stored baseline
  checkMovementAlert(lat, lng)

  /**
   * Updates online/offline status text and styling, and triggers offline check.
   */
  function updateStatus() {
    const now = Date.now()
    const isOnline = lastDataTimestamp > 0 && now - lastDataTimestamp <= 30000

    if (statusEl) {
      if (isOnline) {
        statusEl.textContent = 'EN LIGNE'
        statusEl.style.color = 'var(--accent-green)'
      } else {
        statusEl.textContent = 'HORS LIGNE'
        statusEl.style.color = 'var(--text-muted)'
      }
    }

    checkOfflineAlert(isOnline)
  }

  // Initial status check
  updateStatus()

  // Periodic check every second to flip status if 30s threshold passes
  setInterval(updateStatus, 1000)

  /**
   * Polls latest GPS position every 5 seconds.
   */
  async function pollLatestLocation() {
    try {
      const response = await fetch('/api/locations/latest')
      if (!response.ok) return
      const data = await response.json()
      if (!data || !data.created_at) return

      const newTimestamp = new Date(data.created_at).getTime()
      if (newTimestamp > lastDataTimestamp) {
        lastDataTimestamp = newTimestamp

        if (typeof data.lat === 'number' && typeof data.lng === 'number') {
          marker.setLatLng([data.lat, data.lng])
          map.panTo([data.lat, data.lng])

          if (mapsLink) {
            mapsLink.setAttribute('href', `https://www.google.com/maps?q=${data.lat},${data.lng}`)
          }

          // Check if coordinates moved (second decimal changed)
          checkMovementAlert(data.lat, data.lng)
        }

        if (speedEl && typeof data.speed === 'number') {
          speedEl.textContent = `${(data.speed * 3.6).toFixed(1)} km/h`
        }

        if (dateEl) {
          dateEl.textContent = `Dernière position : ${new Date(data.created_at).toLocaleString('fr-FR')}`
        }
      }

      updateStatus()
    } catch {
      updateStatus()
    }
  }

  setInterval(pollLatestLocation, 5000)
})
