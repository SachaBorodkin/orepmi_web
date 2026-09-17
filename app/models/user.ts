import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

/**
 * User model represents a user in the application.
 * It extends UserSchema and includes authentication capabilities
 * through the withAuthFinder mixin.
 */
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * Alias for name (supports both user.fullName and user.name)
   */
  get fullName(): string {
    return this.name
  }

  set fullName(value: string) {
    this.name = value
  }

  /**
   * Get the user's initials from their name or email.
   * Returns the first letter of first and last name if available,
   * otherwise returns the first two characters of the email or name.
   */
  get initials(): string {
    const displayName = this.name || this.email || 'Utilisateur'
    const parts = displayName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return displayName.slice(0, 2).toUpperCase()
  }
}
