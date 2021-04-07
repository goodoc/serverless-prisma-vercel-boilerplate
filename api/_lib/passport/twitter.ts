import passport from 'passport'
import { Strategy } from 'passport-twitter'
import app from '../..'

export const initializeTwitter = () => {
  let consumerKey: string,
    consumerSecret: string,
    callbackURL: string,
    prefix: string
  try {
    prefix = process.env.VERCEL_URL ? 'https://' : 'http://'
    callbackURL = process.env.VERCEL_URL || 'localhost:3000'
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
        callbackURL: `${prefix}${callbackURL}/api/auth/twitter/callback`,
      },
      function (_token, _tokenSecret, profile, done) {
        console.log('Thank you for logging in', profile.displayName)
        return done(null, { name: profile.displayName })
      },
    ),
  )

  app.get(
    '/api/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/',
      session: false,
    }),
  )

  app.use('/api/auth/twitter', passport.authenticate('twitter'))
}
