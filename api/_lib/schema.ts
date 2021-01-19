import { makeSchema } from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'
import path from 'path'
import { applyMiddleware } from 'graphql-middleware'
import { Mutation } from './mutation'
import { Query } from './query'
import * as Types from './types'
import { permissions } from './permissions'

const generateArtifacts = Boolean(process.env.GENERATE_ARTIFACTS)

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
  permissions,
)
