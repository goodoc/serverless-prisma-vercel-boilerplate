import express from 'express'
import passport from 'passport'
import { graphqlHTTP } from 'express-graphql'
import { schema } from './_lib/schema'
import { createContext } from './_lib/context'

export let ALLOWED_ORIGIN: string[]

try {
  ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!.split(' ')
} catch (err) {
  throw new Error('Please set allowed origins in .env file.')
}

export const app = express()

app.use(
  '/api',
  graphqlHTTP(async (req, res) => ({
    schema,
    context: createContext({ req, res }),
    graphiql: true,
  })),
)

export default app
