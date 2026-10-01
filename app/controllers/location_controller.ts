import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

/**
 * LocationController serves GPS location data for tracker devices.
 */
export default class LocationController {
  /**
   * Returns the single latest GPS reading from the locations table.
   * Used by the front-end map to update the marker position.
   */
  async latest({ response }: HttpContext) {
    const row = await db
      .from('locations')
      .orderBy('created_at', 'desc')
      .first()

    if (!row) {
      return response.json(null)
    }

    return response.json({
      id: row.id,
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude),
      speed: parseFloat(row.speed ?? 0),
      satellites: row.satellites,
      created_at: row.created_at,
    })
  }
}
