import { ApolloServer } from 'apollo-server-micro'
import { schema } from './_lib/schema'
import { createContext } from './_lib/context'
import microCors from 'micro-cors'

export const ALLOWED_ORIGIN: string = process.env.ALLOWED_ORIGIN!

const cors = microCors({
  allowCredentials: true,
  origin: ALLOWED_ORIGIN,
})

const server = new ApolloServer({
  schema,
  context: createContext,
  playground: true,
  introspection: true,
})

const handler = server.createHandler({
  path: '/api',
})

// This is important or cors will fail at preflight
export default cors((req, res) =>
  req.method === 'OPTIONS' ? res.end() : handler(req, res),
)
