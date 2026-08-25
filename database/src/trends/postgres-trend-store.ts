import postgres, { type Sql } from 'postgres'

type TrendStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
type SourceType = 'OPEN_DATA' | 'SEARCH_TRENDS' | 'ARTICLE' | 'RESEARCH' | 'SURVEY' | 'OTHER'

interface ListFilters {
  query?: string
  category?: string
  originCountry?: string
  status?: TrendStatus
  page: number
  limit: number
  publicOnly: boolean
}

interface DraftInput {
  categoryId: string
  title: string
  slug: string
  summary: string
  originCountry: string
  originRegion?: string
  observationStartedAt?: string
  observationEndedAt?: string
  createdBy: string
}

interface SourceInput {
  trendId: string
  type: SourceType
  title: string
  url: string
  publisher?: string
  publishedAt?: string
  consultedAt: string
  evidenceNote: string
}

interface EvaluationInput {
  trendId: string
  scoringConfigId: string
  criteria: Record<'internationalGrowth' | 'localInterest' | 'competitiveAttractiveness' | 'investmentAccessibility' | 'implementationEase' | 'viralPotential', number>
  totalScore: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  justifications: Record<string, string>
  evaluatedBy: string
}

export class PostgresTrendStore {
  private readonly sql: Sql

  constructor(connectionString: string) {
    this.sql = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    })
  }

  async listActiveCategories() {
    const rows = await this.sql`
      SELECT id, name, slug, description
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC, id ASC
    `
    return rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      description: nullableString(row.description),
    }))
  }

  async findActiveScoringConfig(trendId: string) {
    const rows = await this.sql`
      SELECT sc.id, sc.international_growth_weight, sc.local_interest_weight,
        sc.competitive_attractiveness_weight, sc.investment_accessibility_weight,
        sc.implementation_ease_weight, sc.viral_potential_weight
      FROM trends t
      JOIN scoring_configs sc ON sc.category_id = t.category_id AND sc.is_active = true
      WHERE t.id = ${trendId}
      LIMIT 1
    `
    const row = rows[0]
    if (!row) return null
    return {
      id: String(row.id),
      weights: {
        internationalGrowth: Number(row.international_growth_weight),
        localInterest: Number(row.local_interest_weight),
        competitiveAttractiveness: Number(row.competitive_attractiveness_weight),
        investmentAccessibility: Number(row.investment_accessibility_weight),
        implementationEase: Number(row.implementation_ease_weight),
        viralPotential: Number(row.viral_potential_weight),
      },
    }
  }

  async createEvaluation(input: EvaluationInput) {
    const rows = await this.sql`
      INSERT INTO opportunity_evaluations (
        trend_id, scoring_config_id, international_growth_score, local_interest_score,
        competitive_attractiveness_score, investment_accessibility_score,
        implementation_ease_score, viral_potential_score, total_score, level,
        justifications, evaluated_by
      ) VALUES (
        ${input.trendId}, ${input.scoringConfigId}, ${input.criteria.internationalGrowth},
        ${input.criteria.localInterest}, ${input.criteria.competitiveAttractiveness},
        ${input.criteria.investmentAccessibility}, ${input.criteria.implementationEase},
        ${input.criteria.viralPotential}, ${input.totalScore}, ${input.level},
        ${this.sql.json(input.justifications)}, ${input.evaluatedBy}
      )
      RETURNING id, total_score, level
    `
    const row = rows[0]
    return row ? { id: String(row.id), totalScore: Number(row.total_score), level: row.level as 'LOW' | 'MEDIUM' | 'HIGH' } : null
  }

  async list(filters: ListFilters) {
    const where = buildWhere(this.sql, filters)
    const offset = (filters.page - 1) * filters.limit

    const [rows, totals] = await Promise.all([
      this.sql`
        SELECT
          t.id, t.slug, t.title, t.summary, t.origin_country, t.origin_region,
          t.status, t.published_at, t.created_at,
          c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
          evaluation.total_score, evaluation.level
        FROM trends t
        JOIN categories c ON c.id = t.category_id
        LEFT JOIN LATERAL (
          SELECT oe.total_score, oe.level
          FROM opportunity_evaluations oe
          WHERE oe.trend_id = t.id
          ORDER BY oe.created_at DESC, oe.id DESC
          LIMIT 1
        ) evaluation ON true
        ${where}
        ORDER BY COALESCE(t.published_at, t.created_at) DESC, t.id DESC
        LIMIT ${filters.limit} OFFSET ${offset}
      `,
      this.sql`
        SELECT count(*)::int AS total
        FROM trends t
        JOIN categories c ON c.id = t.category_id
        ${where}
      `,
    ])

    const total = Number(totals[0]?.total ?? 0)
    return {
      data: rows.map(mapListItem),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
      },
    }
  }

  async findPublishedBySlug(slug: string) {
    const rows = await this.sql`
      SELECT
        t.id, t.slug, t.title, t.summary, t.origin_country, t.origin_region,
        t.status, t.published_at, t.created_at,
        t.observation_started_at, t.observation_ended_at,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
        evaluation.total_score, evaluation.level
      FROM trends t
      JOIN categories c ON c.id = t.category_id
      LEFT JOIN LATERAL (
        SELECT oe.total_score, oe.level
        FROM opportunity_evaluations oe
        WHERE oe.trend_id = t.id
        ORDER BY oe.created_at DESC, oe.id DESC
        LIMIT 1
      ) evaluation ON true
      WHERE t.slug = ${slug} AND t.status = 'PUBLISHED'
      LIMIT 1
    `
    const row = rows[0]
    if (!row) return null

    const sources = await this.sql`
      SELECT id, type, title, url, publisher, published_at, consulted_at, evidence_note
      FROM trend_sources
      WHERE trend_id = ${row.id} AND is_active = true
      ORDER BY consulted_at DESC, id DESC
    `

    return {
      ...mapListItem(row),
      observationStartedAt: dateValue(row.observation_started_at),
      observationEndedAt: dateValue(row.observation_ended_at),
      sources: sources.map(mapSource),
    }
  }

  async findById(id: string): Promise<{ id: string, status: TrendStatus } | null> {
    const rows = await this.sql`SELECT id, status FROM trends WHERE id = ${id} LIMIT 1`
    const row = rows[0]
    return row ? { id: String(row.id), status: row.status as TrendStatus } : null
  }

  async activeCategoryExists(id: string): Promise<boolean> {
    const rows = await this.sql`SELECT 1 FROM categories WHERE id = ${id} AND is_active = true LIMIT 1`
    return rows.length > 0
  }

  async provisionCategory(input: { name: string, slug: string, description: string }) {
    const rows = await this.sql`
      INSERT INTO categories (name, slug, description, is_active)
      VALUES (${input.name}, ${input.slug}, ${input.description}, true)
      ON CONFLICT (slug) DO UPDATE
      SET name = excluded.name,
          description = excluded.description,
          is_active = true,
          updated_at = now()
      RETURNING id, name, slug
    `
    const category = rows[0]
    if (!category) throw new Error('No se pudo provisionar la categoría.')
    return { id: String(category.id), name: String(category.name), slug: String(category.slug) }
  }

  async provisionScoringConfig(categoryId: string) {
    const rows = await this.sql`
      INSERT INTO scoring_configs (
        category_id, name, version, international_growth_weight, local_interest_weight,
        competitive_attractiveness_weight, investment_accessibility_weight,
        implementation_ease_weight, viral_potential_weight, is_active
      ) VALUES (${categoryId}, 'Índice base TrendIA', 1, 20, 25, 15, 10, 15, 15, true)
      ON CONFLICT (category_id, version) DO UPDATE
      SET name = excluded.name, is_active = true
      RETURNING id
    `
    if (!rows[0]) throw new Error('No se pudo provisionar la configuración de puntaje.')
    return { id: String(rows[0].id) }
  }

  async createDraft(input: DraftInput) {
    const created = await this.sql`
      INSERT INTO trends (
        category_id, title, slug, summary, origin_country, origin_region,
        observation_started_at, observation_ended_at, created_by
      ) VALUES (
        ${input.categoryId}, ${input.title}, ${input.slug}, ${input.summary},
        ${input.originCountry}, ${input.originRegion ?? null},
        ${input.observationStartedAt ?? null}, ${input.observationEndedAt ?? null},
        ${input.createdBy}
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `
    if (!created[0]) return null
    return await this.findListItemById(String(created[0].id))
  }

  async addSource(input: SourceInput) {
    const rows = await this.sql`
      INSERT INTO trend_sources (
        trend_id, type, title, url, publisher, published_at, consulted_at, evidence_note
      ) VALUES (
        ${input.trendId}, ${input.type}, ${input.title}, ${input.url},
        ${input.publisher ?? null}, ${input.publishedAt ?? null},
        ${input.consultedAt}, ${input.evidenceNote}
      )
      ON CONFLICT (trend_id, url) DO NOTHING
      RETURNING id, type, title, url, publisher, published_at, consulted_at, evidence_note
    `
    return rows[0] ? mapSource(rows[0]) : null
  }

  async hasActiveSource(id: string): Promise<boolean> {
    const rows = await this.sql`
      SELECT 1 FROM trend_sources WHERE trend_id = ${id} AND is_active = true LIMIT 1
    `
    return rows.length > 0
  }

  async updateStatus(
    id: string,
    from: TrendStatus,
    to: TrendStatus,
    publishedAt?: Date,
  ): Promise<boolean> {
    const rows = await this.sql`
      UPDATE trends
      SET status = ${to},
          published_at = ${publishedAt ?? null},
          updated_at = now()
      WHERE id = ${id} AND status = ${from}
      RETURNING id
    `
    return rows.length === 1
  }

  async close(): Promise<void> {
    await this.sql.end()
  }

  private async findListItemById(id: string) {
    const rows = await this.sql`
      SELECT
        t.id, t.slug, t.title, t.summary, t.origin_country, t.origin_region,
        t.status, t.published_at, t.created_at,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
        NULL::numeric AS total_score, NULL::opportunity_level AS level
      FROM trends t
      JOIN categories c ON c.id = t.category_id
      WHERE t.id = ${id}
      LIMIT 1
    `
    return rows[0] ? mapListItem(rows[0]) : null
  }
}

function buildWhere(sql: Sql, filters: ListFilters) {
  const conditions = []
  if (filters.publicOnly) conditions.push(sql`t.status = 'PUBLISHED'`)
  else if (filters.status) conditions.push(sql`t.status = ${filters.status}`)
  if (filters.category) conditions.push(sql`c.slug = ${filters.category}`)
  if (filters.originCountry) conditions.push(sql`t.origin_country = ${filters.originCountry}`)
  if (filters.query) {
    const query = `%${filters.query}%`
    conditions.push(sql`(t.title ILIKE ${query} OR t.summary ILIKE ${query})`)
  }
  if (conditions.length === 0) return sql``
  const conjunction = conditions.slice(1).reduce((combined, condition) => sql`${combined} AND ${condition}`, conditions[0]!)
  return sql`WHERE ${conjunction}`
}

function mapListItem(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    originCountry: String(row.origin_country),
    originRegion: nullableString(row.origin_region),
    status: row.status as TrendStatus,
    category: {
      id: String(row.category_id),
      name: String(row.category_name),
      slug: String(row.category_slug),
    },
    opportunity: row.total_score === null || row.total_score === undefined
      ? null
      : { totalScore: Number(row.total_score), level: row.level as 'LOW' | 'MEDIUM' | 'HIGH' },
    publishedAt: row.published_at instanceof Date ? row.published_at : null,
    createdAt: row.created_at as Date,
  }
}

function mapSource(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    type: row.type as SourceType,
    title: String(row.title),
    url: String(row.url),
    publisher: nullableString(row.publisher),
    publishedAt: dateValue(row.published_at),
    consultedAt: dateValue(row.consulted_at)!,
    evidenceNote: String(row.evidence_note),
  }
}

function nullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value)
}

function dateValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}
