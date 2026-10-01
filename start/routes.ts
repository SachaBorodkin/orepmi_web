/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

const HomeController = () => import('#controllers/home_controller')
router.get('/', [HomeController, 'index']).as('home')
router.on('/help').render('pages/help').as('help')

// Public API — latest GPS location for the live map
const LocationController = () => import('#controllers/location_controller')
router.get('/api/locations/latest', [LocationController, 'latest']).as('api.locations.latest')

// Google OAuth — server-side PKCE flow via Supabase
// These routes are intentionally outside the guest middleware so the callback
// URL is always reachable (Supabase redirects here after Google authenticates).
const GoogleAuthController = () => import('#controllers/google_auth_controller')
router.get('/auth/google', [GoogleAuthController, 'redirect']).as('auth.google')
router.get('/auth/google/callback', [GoogleAuthController, 'callback']).as('auth.google.callback')
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
