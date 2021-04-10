import { rule, shield } from 'graphql-shield'
import { getUserId } from '../utils'

const rules = {
  isAuthenticatedUser: rule()(async (parent, args, context) => {
    const userId = getUserId(context)
    const user = await context.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    return Boolean(userId)
  }),
}

export const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
  },
})
