import passport from 'passport'
import type { Express } from 'express'

var Strategy = require('passport-twitter').Strategy

export const initializeTwitter = (app: Express) => {
  let consumerKey, consumerSecret, callbackURL
  try {
    callbackURL = process.env.VERCEL_URL || 'http://localhost:3000'
    consumerKey = process.env.TWITTER_CONSUMER_KEY!
    consumerSecret = process.env.TWITTER_CONSUMER_SECRET!
  } catch (err) {
    throw new Error(
      'Twitter keys are missing, please add them to your .env file.',
    )
  }

  passport.use(
    new Strategy(
      {
        consumerKey,
        consumerSecret,
        callbackURL: `${callbackURL}/auth/twitter/callback`,
      },
      function (token: any, tokenSecret: any, profile: any, cb: any) {
        console.log('Thank you for logging in', profile.displayName)
      },
    ),
  )

  app.get('/auth/twitter', passport.authenticate('twitter'))

  app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/login',
    }),
  )
}
