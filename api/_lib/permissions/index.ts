import { rule, shield } from 'graphql-shield'
import { getUserId } from '../utils'

const rules = {
  isAuthenticatedUser: rule()(async (parent, args, context) => {
    const userId = getUserId(context)
    const user = await context.prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    })
    return Boolean(userId)
  }),
}

// Being admin or mod takes precedence over being banned or not
export const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
  },
})
