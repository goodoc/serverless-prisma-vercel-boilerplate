import { PrismaClient } from '@prisma/client'
import { IncomingMessage, ServerResponse } from 'http'

const prisma = new PrismaClient({
  // Uncomment for debugging purposes
  // log: ['query', 'info', 'warn'],
})

export interface Context {
  prisma: PrismaClient
  res: ServerResponse
  req: IncomingMessage
}

// @ts-ignore
export function createContext({ req, res, ...rest }: Context) {
  return {
    req,
    res,
    prisma,
  }
}
