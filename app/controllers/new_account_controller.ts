import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * NewAccountController handles user registration.
 */
export default class NewAccountController {
  /**
   * Display the signup page
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  /**
   * Create a new user account and authenticate the user
   */
  async store({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    })

    await auth.use('web').login(user)
    session.flash('success', 'Bienvenue sur orepmi ! Votre compte a été créé avec succès.')
    return response.redirect().toRoute('home')
  }
}
