import { mutationType, stringArg, nonNull } from 'nexus'
import passport from 'passport'
import {
  issueTokens,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
} from './utils'

export const Mutation = mutationType({
  definition(t) {
    t.field('register', {
      type: 'User',
      args: {
        username: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (
        _parent,
        { username, email, password },
        ctx,
      ): Promise<any> => {
        const hashedPassword = await hashPassword(password)

        let user
        try {
          user = await ctx.prisma.user.create({
            data: {
              username,
              email,
              password: hashedPassword,
            },
          })
        } catch (err) {
          return new Error(err)
        }
        await issueTokens(ctx.res, user)

        return user
      },
    })
    t.field('login', {
      type: 'User',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password }, ctx): Promise<any> => {
        let user
        try {
          user = await ctx.prisma.user.findFirst({
            where: { email },
          })
        } catch (err) {
          return new Error(err)
        }

        if (!user) {
          // Error to throw if user isn't found
          return new Error('Login failed.')
        }

        const isValid = await comparePassword(password, user.password!)

        if (isValid) {
          await issueTokens(ctx.res, user)
        } else {
          // Error to throw if passwords don't match
          return new Error('Login failed.')
        }

        return user
      },
    })

    t.field('refresh', {
      type: 'User',
      resolve: async (_parent, args, ctx): Promise<any> => {
        let userId
        try {
          userId = verifyRefreshToken(ctx)
        } catch (err) {
          return new Error(err)
        }
        let user
        try {
          user = await ctx.prisma.user.findUnique({
            where: { id: userId },
          })
        } catch (err) {
          return new Error(err)
        }

        if (user) {
          await issueTokens(ctx.res, user)
        } else {
          return new Error('Could not refresh token.')
        }

        return user
      },
    })
  },
})
