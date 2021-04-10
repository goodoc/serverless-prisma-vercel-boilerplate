import express from 'express'
import passport from 'passport'
import { graphqlHTTP } from 'express-graphql'
import { schema } from './_lib/schema'
import { createContext } from './_lib/context'
import { initializePassport } from './_lib/passport/init'
import cors from 'cors'

export let ALLOWED_ORIGIN: string[]

try {
  ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!.split(' ')
} catch (err) {
  throw new Error('Please set allowed origins in .env file.')
}

export const app = express()

const corsOptions = {
  origin: ALLOWED_ORIGIN,
}

app.use(cors(corsOptions))

export let secret: string
try {
  secret = process.env.APP_SECRET!
} catch (err) {
  throw new Error(
    'Your APP_SECRET variable could not be found. Please set it in your .env file.',
  )
}

initializePassport()

app.use(
  '/api',
  graphqlHTTP(async (req, res) => ({
    schema,
    context: createContext({ req, res }),
    graphiql: true,
  })),
)

export default app
