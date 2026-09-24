import { test } from '@japa/runner'
import edge from 'edge.js'
import fs from 'node:fs'

test.group('Add Tracker Modal', () => {
  test('modal partial renders "Bientôt disponible" and all modal components', async ({ assert }) => {
    const html = await edge.render('partials/add_tracker_modal', {})

    // Check required texts
    assert.include(html, 'Bientôt disponible')
    assert.include(html, 'Ajouter un tracker')
    assert.include(html, 'OREPMI SATELLITE NETWORK')

    // Check interaction controls
    assert.include(html, 'modal-close-btn')
    assert.include(html, 'modal-btn-confirm')
    assert.include(html, '$store.trackerModal.close()')
    assert.include(html, '$store.trackerModal.isOpen')
  })

  test('home.edge uses custom modal trigger instead of native alert()', ({ assert }) => {
    const homeContent = fs.readFileSync('resources/views/pages/home.edge', 'utf-8')

    // Ensure raw alert() was removed
    assert.notInclude(homeContent, "alert('Fonctionnalité d\\'ajout de tracker bientôt disponible.')")
    assert.notInclude(homeContent, 'onclick="alert(')

    // Ensure Alpine trackerModal store open() is used
    assert.include(homeContent, '$store.trackerModal.open()')
    assert.include(homeContent, 'add-tracker-card')
  })

  test('layout.edge includes the add_tracker_modal partial', ({ assert }) => {
    const layoutContent = fs.readFileSync('resources/views/components/layout.edge', 'utf-8')

    assert.include(layoutContent, "@include('partials/add_tracker_modal')")
  })
})
