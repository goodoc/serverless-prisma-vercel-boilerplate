import { queryType } from 'nexus'
import { getUserId } from './utils'

export const Query = queryType({
  definition(t) {
    t.field('me', {
      type: 'User',
      resolve: async (parent, args, ctx): Promise<any> => {
        const userId = getUserId(ctx)
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: userId,
          },
        })
        return user
      },
    })
  },
})
