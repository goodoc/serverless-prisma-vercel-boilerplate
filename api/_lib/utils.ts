import { sign, verify } from 'jsonwebtoken'
import { Context } from './context'
import { compare, hash } from 'bcryptjs'
import { Prisma, User } from '@prisma/client'
require('dotenv').config()
const cookie = require('cookie')

export const APP_SECRET: string = process.env.APP_SECRET!

interface Token {
  userId: string
}

export function getUserId(context: Context, bypassError: boolean = false) {
  if (context.req.headers['cookie']) {
    const Authorization = cookie.parse(context.req.headers['cookie'])
    const { accessToken } = Authorization
    try {
      const verifiedToken = verify(accessToken, APP_SECRET) as Token
      return verifiedToken && verifiedToken.userId
    } catch (error) {
      throw new Error('Could not authenticate user.')
    }
  }
}

export async function hashPassword(plaintextPassword: string) {
  return await hash(plaintextPassword, 10)
}

export async function comparePassword(
  plaintextPassword: string,
  hashedPassword: string,
) {
  return await compare(plaintextPassword, hashedPassword)
}

export function verifyRefreshToken(context: Context) {
  if (context.req.headers['cookie']) {
    const Authorization = cookie.parse(context.req.headers['cookie'])
    const { refreshToken } = Authorization
    try {
      const verifiedToken = verify(refreshToken, APP_SECRET) as Token
      return verifiedToken && verifiedToken.userId
    } catch (error) {
      throw new Error('Could not authenticate user.')
    }
  }
}

export async function issueTokens(ctx: Context, user: User) {
  const securedAccessToken = sign(
    { userId: user.id, role: user.role },
    APP_SECRET,
    {
      expiresIn: 60000 * 15,
    },
  )

  const securedRefreshToken = sign({ userId: user.id }, APP_SECRET, {
    expiresIn: 60000 * 15,
  })

  ctx.res.setHeader('Set-Cookie', [
    `accessToken=${securedAccessToken}; HttpOnly; Expires=${new Date(
      Date.now() + 60000 * 15,
    )};`,
    `refreshToken=${securedRefreshToken}; HttpOnly; Expires=${new Date(
      Date.now() + 60000 * 60 * 24 * 30,
    )};`,
  ])
}
