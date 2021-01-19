const { PrismaClient } = require('@prisma/client')
const { userData } = require('./seedData')

const prisma = new PrismaClient()

const tableNames = ['User']

const main = async () => {
  // This will clear data from all tables
  for (const tableName of tableNames) {
    await prisma.$queryRaw(`DELETE FROM "${tableName}";`)

    // If we have any autoincrement sequences, this will reset them
    // sequences are always lowercase
    try {
      if (!['Store'].includes(tableName.toLowerCase())) {
        await prisma.$queryRaw(
          `ALTER SEQUENCE "${tableName.toLowerCase()}_id_seq" RESTART WITH 1;`,
        )
      }
    } catch {}
  }

  // Populate our user table. Use a 'for' loop or you'll break the await
  for (const user of userData) {
    await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        role: user.role,
        password: user.password,
      },
    })
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
