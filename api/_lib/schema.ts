import { makeSchema } from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'
import path from 'path'
import { applyMiddleware, IMiddleware } from 'graphql-middleware'
import { Mutation } from './mutation'
import { Query } from './query'
import * as Types from './types'
import { permissions } from './permissions'
import { Context } from './context'
import { verifyAccessToken } from './utils'

const generateArtifacts = Boolean(process.env.GENERATE_ARTIFACTS)

const checkAccessToken: IMiddleware<any, any, any> = async (
  resolve,
  root,
  args,
  context: Context,
  info,
) => {
  verifyAccessToken(context)
  const result = await resolve(root, args, context, info)
  return result
}

export const schema = applyMiddleware(
  makeSchema({
    types: [Query, Mutation, Types],
    plugins: [
      nexusPrisma({
        experimentalCRUD: true,
        shouldGenerateArtifacts: generateArtifacts,
        outputs: {
          typegen: path.join(__dirname, '/generated/prisma-nexus.ts'),
        },
      }),
    ],
    shouldGenerateArtifacts: generateArtifacts,
    outputs: {
      schema: path.join(__dirname, '/../../schema.graphql'),
      typegen: path.join(__dirname, '/generated/nexus.ts'),
    },
    contextType: {
      module: require.resolve('./context'),
      export: 'Context',
    },
    sourceTypes: {
      modules: [
        {
          module: '@prisma/client',
          alias: 'prisma',
        },
      ],
    },
  }),
  checkAccessToken,
  permissions,
)
