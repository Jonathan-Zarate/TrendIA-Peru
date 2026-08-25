import { PostgresTrendStore, PostgresUserStore } from '@trendia/database'
import { TrendService, type EvaluateTrendInput } from '../src/trends/trend-service.js'

const connectionString = process.env.DATABASE_URL?.trim()
if (!connectionString) throw new Error('Falta la variable de entorno DATABASE_URL.')

const trendStore = new PostgresTrendStore(connectionString)
const userStore = new PostgresUserStore(connectionString)
const service = new TrendService(trendStore)

const initialTrends = [
  {
    title: 'Cabinas fotográficas coreanas personalizadas',
    summary: 'Experiencias de fotografía autoservicio con marcos temáticos, archivos digitales y colaboraciones culturales, adaptables a centros comerciales, ferias y comunidades juveniles peruanas.',
    originCountry: 'KR',
    originRegion: 'Seúl',
    observationStartedAt: '2023-01-01',
    observationEndedAt: '2025-07-16',
    sources: [
      { type: 'ARTICLE', title: 'The Four-Cut Photo Craze in Korea', url: 'https://english.visitkorea.or.kr/svc/sp/HallyuNew/contentsView.do?dataSetId=70&vcontsId=228864', publisher: 'Korea Tourism Organization', publishedAt: '2025-07-16', consultedAt: '2026-08-25', evidenceNote: 'Documenta el crecimiento de 1 006 locales en 2023 a más de 3 000 en 2024 y una audiencia mayoritariamente adolescente y joven.' },
      { type: 'ARTICLE', title: 'La calle baila: comunidad K-pop juvenil en Perú', url: 'https://www.tvperu.gob.pe/noticias/cultural/bajo-el-sol-la-danza-se-vuelve-identidad-asi-arranca-la-calle-baila', publisher: 'TVPerú', publishedAt: '2025-05-24', consultedAt: '2026-08-25', evidenceNote: 'Registra comunidades juveniles peruanas vinculadas al K-pop y su uso de espacios públicos, una señal local para validar experiencias temáticas.' },
    ],
    scores: { internationalGrowth: 88, localInterest: 78, competitiveAttractiveness: 65, investmentAccessibility: 55, implementationEase: 72, viralPotential: 90 },
    justifications: {
      internationalGrowth: 'VisitKorea reporta que los locales crecieron de 1 006 a más de 3 000 entre 2023 y 2024.',
      localInterest: 'TVPerú documenta comunidades K-pop juveniles activas en espacios públicos peruanos.',
      competitiveAttractiveness: 'La propuesta puede diferenciarse con marcos de artistas locales y alianzas temporales; falta medir competidores por distrito.',
      investmentAccessibility: 'Requiere cabina, cámara, iluminación, impresión y software; es viable como piloto, pero no es una inversión mínima.',
      implementationEase: 'La operación es autoservicio y la tecnología existe; quedan licencias de imágenes, mantenimiento y soporte local.',
      viralPotential: 'El archivo digital, los videos cortos y los marcos de fandom están diseñados para compartirse en redes sociales.',
    },
  },
  {
    title: 'Live shopping para microempresas peruanas',
    summary: 'Ventas en vivo que combinan demostración, conversación y compra inmediata para que las MYPE conviertan audiencias sociales en pedidos medibles.',
    originCountry: 'CN',
    originRegion: 'Mercado digital nacional',
    observationStartedAt: '2024-01-01',
    observationEndedAt: '2025-12-31',
    sources: [
      { type: 'OPEN_DATA', title: 'Desarrollo de nuevos formatos de comercio electrónico en China', url: 'https://www.stats.gov.cn/sj/sjjd/202606/t20260604_1963887.html', publisher: 'National Bureau of Statistics of China', publishedAt: '2026-06-04', consultedAt: '2026-08-25', evidenceNote: 'Reporta crecimiento superior al 10 % del comercio electrónico por transmisiones en vivo durante 2025.' },
      { type: 'ARTICLE', title: 'Más de 1 500 MYPE participaron en CyberWow 2025', url: 'https://www.gob.pe/institucion/produce/noticias/1292320-produce-mas-de-1500-mype-participaron-en-las-ediciones-del-cyberwow-2025-y-superaron-los-s-1-4-millones-en-ventas', publisher: 'Ministerio de la Producción del Perú', publishedAt: '2025-11-19', consultedAt: '2026-08-25', evidenceNote: 'Muestra adopción local de campañas de comercio electrónico por más de 1 500 MYPE y ventas reportadas superiores a S/ 1,4 millones.' },
    ],
    scores: { internationalGrowth: 85, localInterest: 72, competitiveAttractiveness: 62, investmentAccessibility: 75, implementationEase: 78, viralPotential: 86 },
    justifications: {
      internationalGrowth: 'La oficina nacional de estadística china informa crecimiento de dos dígitos del live commerce durante 2025.',
      localInterest: 'PRODUCE registra participación de más de 1 500 MYPE peruanas en campañas digitales y ventas efectivas.',
      competitiveAttractiveness: 'Existen redes y plataformas de venta, pero hay espacio para una solución guiada y medible orientada a MYPE.',
      investmentAccessibility: 'Un piloto puede operar con teléfono, iluminación básica, catálogo y enlace de pago sin infraestructura pesada.',
      implementationEase: 'Las herramientas de transmisión y pago ya existen; el reto principal es integrar catálogo, operación y capacitación.',
      viralPotential: 'El formato en vivo combina urgencia, demostración y conversación, elementos con alta capacidad de distribución social.',
    },
  },
  {
    title: 'Micromercados autónomos con pago digital',
    summary: 'Puntos compactos de venta sin caja tradicional, apoyados en identificación de productos y pagos digitales, para edificios, centros educativos y oficinas.',
    originCountry: 'JP',
    originRegion: 'Japón',
    observationStartedAt: '2024-01-01',
    observationEndedAt: '2025-09-30',
    sources: [
      { type: 'RESEARCH', title: 'Casos de implementación social de IA', url: 'https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20241226_2.pdf', publisher: 'Ministry of Economy, Trade and Industry of Japan', publishedAt: '2024-12-26', consultedAt: '2026-08-25', evidenceNote: 'Describe tiendas de conveniencia sin personal que emplean reconocimiento de imágenes y dinero digital para calcular y cobrar productos.' },
      { type: 'OPEN_DATA', title: 'Reporte del Sistema Nacional de Pagos y del sector Fintech', url: 'https://www.bcrp.gob.pe/docs/Publicaciones/reporte-del-sistema-nacional-de-pagos/2025/setiembre/rspf-setiembre-2025.pdf', publisher: 'Banco Central de Reserva del Perú', consultedAt: '2026-08-25', evidenceNote: 'Reporta 591 pagos digitales por persona adulta anualizados al primer semestre de 2025 y crecimiento de pagos de bajo valor.' },
    ],
    scores: { internationalGrowth: 65, localInterest: 68, competitiveAttractiveness: 78, investmentAccessibility: 35, implementationEase: 48, viralPotential: 62 },
    justifications: {
      internationalGrowth: 'METI documenta casos reales de tiendas sin personal basadas en visión artificial y pago digital.',
      localInterest: 'El BCRP registra 591 pagos digitales por persona adulta anualizados, una base favorable para experiencias sin efectivo.',
      competitiveAttractiveness: 'El formato todavía es poco común en Perú y puede probarse en ubicaciones controladas antes de competir en retail abierto.',
      investmentAccessibility: 'Sensores, control de pérdidas e integración de pagos elevan la inversión inicial frente a una tienda tradicional pequeña.',
      implementationEase: 'Un micromercado cerrado es viable, aunque reconocimiento, conciliación, inventario y soporte requieren integración especializada.',
      viralPotential: 'La experiencia sin caja resulta novedosa y compartible, pero su recurrencia depende más de conveniencia que de contenido social.',
    },
  },
] as const

try {
  const administrator = await userStore.findByEmail('admin@trendia.demo')
  if (!administrator?.isActive || administrator.role !== 'ADMIN') throw new Error('El usuario demo ADMIN no está disponible.')
  const categories = await service.listCategories()
  const category = categories.find((item) => item.slug === 'tecnologia-negocios-consumo')
  if (!category) throw new Error('La categoría inicial no está disponible.')

  for (const seed of initialTrends) {
    const existing = await service.listInternal({ query: seed.title, page: 1, limit: 50 })
    if (existing.data.some((trend) => trend.title === seed.title)) {
      console.log(`Tendencia existente, se omite: ${seed.title}`)
      continue
    }
    const trend = await service.createDraft({ categoryId: category.id, title: seed.title, summary: seed.summary, originCountry: seed.originCountry, originRegion: seed.originRegion, observationStartedAt: seed.observationStartedAt, observationEndedAt: seed.observationEndedAt, createdBy: administrator.id })
    for (const source of seed.sources) await service.addSource({ trendId: trend.id, ...source })
    await service.evaluate({ trendId: trend.id, criteria: seed.scores, justifications: seed.justifications as EvaluateTrendInput['justifications'], evaluatedBy: administrator.id })
    await service.submitForReview(trend.id)
    await service.publish(trend.id)
    console.log(`Tendencia publicada: ${trend.slug}`)
  }
}
finally {
  await Promise.all([trendStore.close(), userStore.close()])
}
