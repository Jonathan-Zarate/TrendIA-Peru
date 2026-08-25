import { Hono, type Context } from 'hono'
import { z } from 'zod'
import { authenticate, requirePermission, type AuthModule, type AuthVariables } from '../auth/http.js'
import { TrendError } from './errors.js'
import { SOURCE_TYPES, TREND_STATUSES } from './model.js'
import { TrendService } from './trend-service.js'

const listSchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  originCountry: z.string().trim().length(2).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
}).strict()

const internalListSchema = listSchema.extend({
  status: z.enum(TREND_STATUSES).optional(),
})

const draftSchema = z.object({
  categoryId: z.uuid(),
  title: z.string().trim().min(3).max(220),
  summary: z.string().trim().min(20).max(2_000),
  originCountry: z.string().trim().length(2),
  originRegion: z.string().trim().min(2).max(120).optional(),
  observationStartedAt: z.iso.date().optional(),
  observationEndedAt: z.iso.date().optional(),
}).strict().refine((value) => (
  !value.observationStartedAt
  || !value.observationEndedAt
  || value.observationEndedAt >= value.observationStartedAt
), {
  path: ['observationEndedAt'],
  message: 'La fecha final no puede ser anterior a la inicial.',
})

const sourceSchema = z.object({
  type: z.enum(SOURCE_TYPES),
  title: z.string().trim().min(3).max(300),
  url: z.url().max(2_000),
  publisher: z.string().trim().min(2).max(180).optional(),
  publishedAt: z.iso.date().optional(),
  consultedAt: z.iso.date(),
  evidenceNote: z.string().trim().min(10).max(2_000),
}).strict()

export interface TrendModule {
  service: TrendService
}

export function createTrendRouter(trends: TrendModule, auth: AuthModule) {
  const router = new Hono<{ Variables: AuthVariables }>()

  router.get('/', async (context) => {
    const input = parseQuery(context, listSchema)
    if (!input.success) return input.response
    return context.json(await trends.service.listPublic(toListInput(input.data)))
  })

  router.get('/categories', async (context) => context.json({
    data: await trends.service.listCategories(),
  }))

  router.get(
    '/manage',
    authenticate(auth),
    requirePermission('trend:draft-manage'),
    async (context) => {
      const input = parseQuery(context, internalListSchema)
      if (!input.success) return input.response
      return context.json(await trends.service.listInternal(toListInput(input.data)))
    },
  )

  router.post(
    '/',
    authenticate(auth),
    requirePermission('trend:draft-manage'),
    async (context) => {
      const input = await parseBody(context, draftSchema)
      if (!input.success) return input.response
      const user = context.get('currentUser')
      return context.json(await trends.service.createDraft({
        categoryId: input.data.categoryId,
        title: input.data.title,
        summary: input.data.summary,
        originCountry: input.data.originCountry,
        createdBy: user.id,
        ...(input.data.originRegion ? { originRegion: input.data.originRegion } : {}),
        ...(input.data.observationStartedAt ? { observationStartedAt: input.data.observationStartedAt } : {}),
        ...(input.data.observationEndedAt ? { observationEndedAt: input.data.observationEndedAt } : {}),
      }), 201)
    },
  )

  router.post(
    '/:id/sources',
    authenticate(auth),
    requirePermission('trend:source-manage'),
    async (context) => {
      const id = z.uuid().safeParse(context.req.param('id'))
      if (!id.success) return validationResponse(context, id.error)
      const input = await parseBody(context, sourceSchema)
      if (!input.success) return input.response
      return context.json(await trends.service.addSource({
        trendId: id.data,
        type: input.data.type,
        title: input.data.title,
        url: input.data.url,
        consultedAt: input.data.consultedAt,
        evidenceNote: input.data.evidenceNote,
        ...(input.data.publisher ? { publisher: input.data.publisher } : {}),
        ...(input.data.publishedAt ? { publishedAt: input.data.publishedAt } : {}),
      }), 201)
    },
  )

  router.post(
    '/:id/submit-review',
    authenticate(auth),
    requirePermission('trend:submit-review'),
    async (context) => {
      const id = z.uuid().safeParse(context.req.param('id'))
      if (!id.success) return validationResponse(context, id.error)
      await trends.service.submitForReview(id.data)
      return context.json({ status: 'IN_REVIEW' })
    },
  )

  router.post(
    '/:id/publish',
    authenticate(auth),
    requirePermission('trend:publish'),
    async (context) => {
      const id = z.uuid().safeParse(context.req.param('id'))
      if (!id.success) return validationResponse(context, id.error)
      await trends.service.publish(id.data)
      return context.json({ status: 'PUBLISHED' })
    },
  )

  router.get('/:slug', async (context) => {
    const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(240).safeParse(context.req.param('slug'))
    if (!slug.success) return validationResponse(context, slug.error)
    return context.json(await trends.service.getPublished(slug.data))
  })

  return router
}

export function trendErrorResponse(error: unknown, context: Context) {
  if (!(error instanceof TrendError)) return null
  return context.json({
    error: {
      code: error.code,
      message: error.message,
      requestId: context.get('requestId'),
    },
  }, error.status)
}

function parseQuery<TSchema extends z.ZodType>(context: Context, schema: TSchema) {
  const parsed = schema.safeParse(context.req.query())
  if (parsed.success) return { success: true as const, data: parsed.data }
  return { success: false as const, response: validationResponse(context, parsed.error) }
}

async function parseBody<TSchema extends z.ZodType>(context: Context, schema: TSchema) {
  try {
    const parsed = schema.safeParse(await context.req.json())
    if (parsed.success) return { success: true as const, data: parsed.data }
    return { success: false as const, response: validationResponse(context, parsed.error) }
  }
  catch {
    return {
      success: false as const,
      response: context.json({
        error: {
          code: 'INVALID_JSON',
          message: 'El cuerpo debe ser JSON válido.',
          requestId: context.get('requestId'),
        },
      }, 400),
    }
  }
}

function validationResponse(context: Context, error: z.ZodError) {
  return context.json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos.',
      details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      requestId: context.get('requestId'),
    },
  }, 400)
}

function toListInput(data: z.output<typeof internalListSchema>) {
  return {
    page: data.page,
    limit: data.limit,
    ...(data.q ? { query: data.q } : {}),
    ...(data.category ? { category: data.category } : {}),
    ...(data.originCountry ? { originCountry: data.originCountry } : {}),
    ...(data.status ? { status: data.status } : {}),
  }
}
