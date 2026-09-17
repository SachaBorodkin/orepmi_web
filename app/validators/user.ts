import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(6).maxLength(64)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(100),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
})

/**
 * Validator to use when logging in
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
