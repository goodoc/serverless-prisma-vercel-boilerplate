import express, { RequestHandler, Response } from 'express'
import passport from 'passport'
import { graphqlHTTP } from 'express-graphql'
import { schema } from './_lib/schema'
import { createContext, prisma } from './_lib/context'
// import { initializePassport } from './_lib/passport/init'
import cors from 'cors'
import { sign } from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { Strategy } from 'passport-twitter'

export let ALLOWED_ORIGIN: string[]

try {
  ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!.split(' ')
} catch (err) {
  throw new Error('Please set allowed origins in .env file.')
}

export const app = express()

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
  }),
)

export let secret: string
try {
  secret = process.env.APP_SECRET!
} catch (err) {
  throw new Error(
    'Your APP_SECRET variable could not be found. Please set it in your .env file.',
  )
}

// initializePassport()

export interface ConvertedUserInterface {
  id: string
  username: string
  verified?: boolean
  url: string
  photo: string
  provider: 'twitter'
}

export interface BasePassportUserInterface {
  id: string
  username: string
  photos: {
    value: string
  }[]
}

type UserInterface = TwitterProfileInterface

app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(
  require('express-session')({
    secret,
    resave: true,
    saveUninitialized: true,
  }),
)

app.get('/api/redirect', async (req, res) => {
  // @ts-ignore
  for (const [key, value] of Object.entries(req.sessionStore.sessions)) {
    // @ts-ignore
    const session = JSON.parse(value)
    // This makes sure the data we get back is the same accross different auth strategies
    const profile = parsePassportProfile(session.passport.user)

    // We find the user from our database
    let user
    try {
      user = await prisma.user.findFirst({
        where: {
          platformId: profile.id,
          provider: 'twitter',
        },
      })
    } catch (err) {
      throw Error(err)
    }

    // And issue access and refresh tokens
    issueTokens(res, { id: user!.id })

    // Don't forget to redirect to your front-end here
    res.redirect('/')
  }
})

// initializeTwitter()

export interface TwitterProfileInterface extends BasePassportUserInterface {
  provider: 'twitter'
  _json: {
    id: number
    name: string
    screen_name: string
    url: string
    verified: boolean
    profile_image_url_https: string
  }
}

let consumerKey: string,
  consumerSecret: string,
  callbackURL: string,
  prefix: string

try {
  prefix = process.env.VERCEL_URL ? 'https://' : 'http://'
  callbackURL = process.env.VERCEL_URL || 'localhost:3000'
  consumerKey = process.env.TWITTER_CONSUMER_KEY!
  consumerSecret = process.env.TWITTER_CONSUMER_SECRET!

  if (!consumerSecret || !consumerKey || !callbackURL) {
    throw new Error()
  }
} catch (err) {
  console.warn(
    `Environment variables 'TWITTER_CONSUMER_KEY' and 'TWITTER_CONSUMER_SECRET' could not be found. Twitter login has been disabled. To stop seeing this warning delete /api/passport/twitter.ts or add the required variables.`,
  )
}

passport.use(
  new Strategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY!,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
      callbackURL: `${process.env.VERCEL_URL ? 'https://' : 'http://'}${
        process.env.VERCEL_URL || 'localhost:3000'
      }/api/auth/twitter/callback`,
    },
    async (_token, _tokenSecret, profile, done) => {
      console.log('Thank you for logging in', profile.displayName)

      // Unfortunately we can't use upsert because our twitter id is not unique
      // So we first find the user and then act depending on if we find it or not
      // This could probably be converted to fairly clean SQL
      let user
      try {
        user = await prisma.user.findFirst({
          where: {
            platformId: profile.id,
            provider: 'twitter',
          },
        })
      } catch (err) {
        console.log(err)
      }

      if (user) {
        await prisma.user.update({
          where: {
            id: user?.id,
          },
          data: {
            username: profile.username,
            photo: profile.photos?.[0].value,
          },
        })
      } else {
        await prisma.user.create({
          data: {
            username: profile.username,
            provider: 'twitter',
            platformId: profile.id,
            photo: profile.photos?.[0].value,
          },
        })
      }

      return done(null, profile)
    },
  ),
)

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj: any, cb) {
  cb(null, obj)
})

app.get(
  '/api/auth/twitter/callback',
  passport.authenticate('twitter', {
    // I first redirect to /api/redirect so we can create some httpOnly cookies, from there we then redirect to the front-end
    successRedirect: '/api/redirect',
    // Failure should probably redirect to your frontend login screen
    failureRedirect: '/login',
  }),
)

// Make sure to end your handler with next()
const handler: RequestHandler = (req, res, next) => {
  next()
}

// You can add more handlers in the array before passport to add more logic to your auth
app.use('/api/auth/twitter', [handler, passport.authenticate('twitter')])

const parsePassportProfile = (u: UserInterface): ConvertedUserInterface => {
  switch (u.provider) {
    case 'twitter':
      return {
        id: u.id,
        username: u.username,
        url: u._json.url,
        photo: u.photos[0].value,
        provider: u.provider,
      }
  }
}

export async function issueTokens(res: Response, user: { id: string }) {
  const fifteenMins = 60000 * 60 * 15
  const aMonth = 60000 * 60 * 24 * 30

  const securedAccessToken = sign({ userId: user.id }, secret, {
    expiresIn: fifteenMins,
  })

  const securedRefreshToken = sign({ userId: user.id }, secret, {
    expiresIn: aMonth,
  })

  res.cookie('accessToken', securedAccessToken, {
    maxAge: fifteenMins,
    httpOnly: true,
  })

  res.cookie('refreshToken', securedRefreshToken, {
    maxAge: aMonth,
    httpOnly: true,
  })
}

app.use(
  '/api',
  graphqlHTTP(async (req, res) => ({
    schema,
    context: createContext({ req, res }),
    graphiql: true,
  })),
)

export default app
