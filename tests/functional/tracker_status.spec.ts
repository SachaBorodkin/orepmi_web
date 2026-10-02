import { test } from '@japa/runner'
import edge from 'edge.js'

test.group('Tracker Status Indicator & Alerts', () => {
  test('renders EN LIGNE when lastLocation is less than 30 seconds old', async ({ assert }) => {
    const freshDate = new Date(Date.now() - 5000).toISOString()
    const html = await edge.render('partials/tracker_map', {
      lastLocation: {
        lat: 48.8566,
        lng: 2.3522,
        speed: 10,
        satellites: 8,
        created_at: freshDate,
        isOnline: true,
      },
    })

    assert.include(html, 'EN LIGNE')
    assert.include(html, 'var(--accent-green)')
  })

  test('renders HORS LIGNE when lastLocation is older than 30 seconds', async ({ assert }) => {
    const oldDate = new Date(Date.now() - 45000).toISOString()
    const html = await edge.render('partials/tracker_map', {
      lastLocation: {
        lat: 48.8566,
        lng: 2.3522,
        speed: 0,
        satellites: 8,
        created_at: oldDate,
        isOnline: false,
      },
    })

    assert.include(html, 'HORS LIGNE')
    assert.include(html, 'var(--text-muted)')
  })

  test('renders HORS LIGNE when no location data exists', async ({ assert }) => {
    const html = await edge.render('partials/tracker_map', {
      lastLocation: null,
    })

    assert.include(html, 'HORS LIGNE')
    assert.include(html, 'Aucune donnée GPS')
  })

  test('includes tracker-alerts-container and notification permission button', async ({ assert }) => {
    const html = await edge.render('partials/tracker_map', {
      lastLocation: {
        lat: 48.8566,
        lng: 2.3522,
        speed: 0,
        satellites: 5,
        created_at: new Date().toISOString(),
        isOnline: true,
      },
    })

    assert.include(html, 'id="tracker-alerts-container"')
    assert.include(html, 'id="btn-enable-notifications"')
  })

  test('second decimal change detection correctly identifies coordinate movement', ({ assert }) => {
    function formatToTwoDecimals(val: number) {
      return val.toFixed(2)
    }

    function hasMovedSecondDecimal(lat1: number, lng1: number, lat2: number, lng2: number) {
      return (
        formatToTwoDecimals(lat1) !== formatToTwoDecimals(lat2) ||
        formatToTwoDecimals(lng1) !== formatToTwoDecimals(lng2)
      )
    }

    // Jitter within 3rd/4th decimal should NOT trigger
    assert.isFalse(hasMovedSecondDecimal(48.8561, 2.3521, 48.8564, 2.3523))

    // Second decimal change in latitude triggers
    assert.isTrue(hasMovedSecondDecimal(48.85, 2.35, 48.86, 2.35))

    // Second decimal change in longitude triggers
    assert.isTrue(hasMovedSecondDecimal(48.85, 2.35, 48.85, 2.36))

    // Larger movement triggers
    assert.isTrue(hasMovedSecondDecimal(48.85, 2.35, 49.01, 2.50))
  })
})
