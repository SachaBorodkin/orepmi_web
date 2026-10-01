import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

/**
 * HomeController renders the dashboard with the latest GPS position
 * already embedded in the page (no client-side fetch required).
 */
export default class HomeController {
  async index({ view }: HttpContext) {
    const row = await db.from('gps_logs').orderBy('created_at', 'desc').first()

    const lastLocation = row
      ? {
          lat: parseFloat(row.latitude),
          lng: parseFloat(row.longitude),
          speed: parseFloat(row.speed ?? 0),
          satellites: row.satellites ?? 0,
          created_at: row.created_at,
        }
      : null

    return view.render('pages/home', { lastLocation })
  }
}
