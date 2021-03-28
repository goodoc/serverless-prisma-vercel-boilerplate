import passport from 'passport'
import type { Express } from 'express'
import { initializeTwitter } from './twitter'

export const initializePassport = (app: Express) => {
  let secret
  try {
    secret = process.env.APP_SECRET!
  } catch (err) {
    throw new Error(
      'Your APP_SECRET variable could not be found. Please set it in your .env file.',
    )
  }
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(
    require('express-session')({
      secret,
      resave: true,
      saveUninitialized: true,
    }),
  )
  initializeTwitter(app)
}
