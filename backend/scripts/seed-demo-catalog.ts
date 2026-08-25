import { PostgresTrendStore } from '@trendia/database'

const connectionString = process.env.DATABASE_URL?.trim()
if (!connectionString) throw new Error('Falta la variable de entorno DATABASE_URL.')

const trends = new PostgresTrendStore(connectionString)

try {
  const category = await trends.provisionCategory({
    name: 'Tecnología y negocios de consumo',
    slug: 'tecnologia-negocios-consumo',
    description: 'Tendencias tecnológicas y experiencias de consumo adaptables al mercado peruano.',
  })
  console.log(`Categoría provisionada: ${category.slug} (${category.id})`)
}
finally {
  await trends.close()
}
