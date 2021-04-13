import { rule, shield } from 'graphql-shield'
import { getUserId } from '../utils'

const rules = {
  isAuthenticatedUser: rule()(async (parent, args, context) => {
    const userId = getUserId(context)
    try {
      const user = await context.prisma.user.findUnique({
        where: {
          id: userId,
        },
      })
      if (!user) {
        throw new Error('Not authorised!')
      }
    } catch (err) {
      throw new Error(err)
    }

    return Boolean(userId)
  }),
}

export const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
  },
})
