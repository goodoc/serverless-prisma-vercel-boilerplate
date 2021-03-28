import express from 'express'
import passport from 'passport'
import { graphqlHTTP } from 'express-graphql'
import { schema } from './_lib/schema'
import { createContext } from './_lib/context'

var Strategy = require('passport-twitter').Strategy

export let ALLOWED_ORIGIN: string[]

try {
  ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!.split(' ')
} catch (err) {
  throw new Error('Please set allowed origins in .env file.')
}

export const app = express()

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
    function (token: any, tokenSecret: any, profile: any, cb: any) {
      console.log('Thank you for logging in', profile.displayName)
    },
  ),
)

app.use(
  '/api/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
)

app.use('/api/auth/twitter', passport.authenticate('twitter'))

app.get('/api/testing', (req, res) =>
  res.json({ callbackURL, vercelURL: process.env.VERCEL_URL }),
)

app.use(
  '/api',
  graphqlHTTP(async (req, res) => ({
    schema,
    context: createContext({ req, res }),
    graphiql: true,
  })),
)

export default app
