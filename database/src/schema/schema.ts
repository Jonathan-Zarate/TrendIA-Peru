import { sql } from 'drizzle-orm'
import {
  boolean, char, check, date, index, integer, jsonb, numeric, pgEnum, pgTable,
  smallint, text, timestamp, uniqueIndex, uuid, varchar,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'ANALYST', 'ENTREPRENEUR'])
export const trendStatusEnum = pgEnum('trend_status', ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'])
export const sourceTypeEnum = pgEnum('source_type', [
  'OPEN_DATA', 'SEARCH_TRENDS', 'ARTICLE', 'RESEARCH', 'SURVEY', 'OTHER',
])
export const opportunityLevelEnum = pgEnum('opportunity_level', ['LOW', 'MEDIUM', 'HIGH'])
export const analysisStatusEnum = pgEnum('analysis_status', ['GENERATED', 'REVIEWED', 'APPROVED', 'REJECTED'])

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 180 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  failedLoginAttempts: smallint('failed_login_attempts').notNull().default(0),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('ck_users_failed_attempts_nonnegative', sql`${table.failedLoginAttempts} >= 0`),
  check('ck_users_email_normalized', sql`${table.email} = lower(${table.email})`),
])

export const trends = pgTable('trends', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  title: varchar('title', { length: 220 }).notNull(),
  slug: varchar('slug', { length: 240 }).notNull().unique(),
  summary: text('summary').notNull(),
  originCountry: char('origin_country', { length: 2 }).notNull(),
  originRegion: varchar('origin_region', { length: 120 }),
  status: trendStatusEnum('status').notNull().default('DRAFT'),
  observationStartedAt: date('observation_started_at'),
  observationEndedAt: date('observation_ended_at'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_trends_catalog').on(table.status, table.categoryId, table.createdAt),
  check('ck_trends_origin_country_uppercase', sql`${table.originCountry} = upper(${table.originCountry})`),
  check(
    'ck_trends_observation_window',
    sql`${table.observationStartedAt} is null or ${table.observationEndedAt} is null or ${table.observationEndedAt} >= ${table.observationStartedAt}`,
  ),
  check(
    'ck_trends_publication_timestamp',
    sql`(${table.status} = 'PUBLISHED' and ${table.publishedAt} is not null) or (${table.status} <> 'PUBLISHED')`,
  ),
])

export const trendSources = pgTable('trend_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  trendId: uuid('trend_id').notNull().references(() => trends.id, { onDelete: 'cascade' }),
  type: sourceTypeEnum('type').notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  url: text('url').notNull(),
  publisher: varchar('publisher', { length: 180 }),
  publishedAt: date('published_at'),
  consultedAt: date('consulted_at').notNull(),
  evidenceNote: text('evidence_note').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('uq_trend_sources_trend_url').on(table.trendId, table.url),
  index('idx_trend_sources_trend').on(table.trendId, table.isActive),
])

export const scoringConfigs = pgTable('scoring_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  name: varchar('name', { length: 160 }).notNull(),
  version: integer('version').notNull(),
  internationalGrowthWeight: smallint('international_growth_weight').notNull(),
  localInterestWeight: smallint('local_interest_weight').notNull(),
  competitiveAttractivenessWeight: smallint('competitive_attractiveness_weight').notNull(),
  investmentAccessibilityWeight: smallint('investment_accessibility_weight').notNull(),
  implementationEaseWeight: smallint('implementation_ease_weight').notNull(),
  viralPotentialWeight: smallint('viral_potential_weight').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('uq_scoring_configs_category_version').on(table.categoryId, table.version),
  uniqueIndex('uq_scoring_configs_one_active_per_category').on(table.categoryId).where(sql`${table.isActive} = true`),
  check('ck_scoring_configs_positive_version', sql`${table.version} > 0`),
  check('ck_scoring_configs_international_growth_weight', sql`${table.internationalGrowthWeight} between 0 and 100`),
  check('ck_scoring_configs_local_interest_weight', sql`${table.localInterestWeight} between 0 and 100`),
  check('ck_scoring_configs_competitive_weight', sql`${table.competitiveAttractivenessWeight} between 0 and 100`),
  check('ck_scoring_configs_investment_weight', sql`${table.investmentAccessibilityWeight} between 0 and 100`),
  check('ck_scoring_configs_implementation_weight', sql`${table.implementationEaseWeight} between 0 and 100`),
  check('ck_scoring_configs_viral_weight', sql`${table.viralPotentialWeight} between 0 and 100`),
  check(
    'ck_scoring_configs_weights_sum_100',
    sql`${table.internationalGrowthWeight} + ${table.localInterestWeight} + ${table.competitiveAttractivenessWeight} + ${table.investmentAccessibilityWeight} + ${table.implementationEaseWeight} + ${table.viralPotentialWeight} = 100`,
  ),
])

export interface OpportunityJustifications {
  internationalGrowth: string
  localInterest: string
  competitiveAttractiveness: string
  investmentAccessibility: string
  implementationEase: string
  viralPotential: string
}

export const opportunityEvaluations = pgTable('opportunity_evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  trendId: uuid('trend_id').notNull().references(() => trends.id, { onDelete: 'cascade' }),
  scoringConfigId: uuid('scoring_config_id').notNull().references(() => scoringConfigs.id),
  internationalGrowthScore: smallint('international_growth_score').notNull(),
  localInterestScore: smallint('local_interest_score').notNull(),
  competitiveAttractivenessScore: smallint('competitive_attractiveness_score').notNull(),
  investmentAccessibilityScore: smallint('investment_accessibility_score').notNull(),
  implementationEaseScore: smallint('implementation_ease_score').notNull(),
  viralPotentialScore: smallint('viral_potential_score').notNull(),
  totalScore: numeric('total_score', { precision: 5, scale: 2, mode: 'number' }).notNull(),
  level: opportunityLevelEnum('level').notNull(),
  justifications: jsonb('justifications').$type<OpportunityJustifications>().notNull(),
  evaluatedBy: uuid('evaluated_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_opportunity_evaluations_trend_created').on(table.trendId, table.createdAt),
  check('ck_opportunity_evaluations_international_growth', sql`${table.internationalGrowthScore} between 0 and 100`),
  check('ck_opportunity_evaluations_local_interest', sql`${table.localInterestScore} between 0 and 100`),
  check('ck_opportunity_evaluations_competitive', sql`${table.competitiveAttractivenessScore} between 0 and 100`),
  check('ck_opportunity_evaluations_investment', sql`${table.investmentAccessibilityScore} between 0 and 100`),
  check('ck_opportunity_evaluations_implementation', sql`${table.implementationEaseScore} between 0 and 100`),
  check('ck_opportunity_evaluations_viral', sql`${table.viralPotentialScore} between 0 and 100`),
  check('ck_opportunity_evaluations_total', sql`${table.totalScore} between 0 and 100`),
  check(
    'ck_opportunity_evaluations_level',
    sql`(${table.totalScore} < 40 and ${table.level} = 'LOW') or (${table.totalScore} >= 40 and ${table.totalScore} < 70 and ${table.level} = 'MEDIUM') or (${table.totalScore} >= 70 and ${table.level} = 'HIGH')`,
  ),
])

export interface AiAnalysisContent {
  targetAudience: string
  problem: string
  localAdaptation: string
  revenueModel: string
  risks: string[]
  recommendedMvp: string
  suggestedSurveyQuestions: string[]
}

export const aiAnalyses = pgTable('ai_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  trendId: uuid('trend_id').notNull().references(() => trends.id, { onDelete: 'cascade' }),
  evaluationId: uuid('evaluation_id').references(() => opportunityEvaluations.id),
  requestedBy: uuid('requested_by').notNull().references(() => users.id),
  provider: varchar('provider', { length: 80 }).notNull(),
  model: varchar('model', { length: 120 }).notNull(),
  promptVersion: varchar('prompt_version', { length: 40 }).notNull(),
  content: jsonb('content').$type<AiAnalysisContent>().notNull(),
  rawResponse: jsonb('raw_response').notNull(),
  status: analysisStatusEnum('status').notNull().default('GENERATED'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_ai_analyses_trend_created').on(table.trendId, table.createdAt),
  check(
    'ck_ai_analyses_human_review',
    sql`${table.status} = 'GENERATED' or (${table.reviewedBy} is not null and ${table.reviewedAt} is not null)`,
  ),
])

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id'),
  requestId: varchar('request_id', { length: 120 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_audit_logs_entity').on(table.entityType, table.entityId, table.createdAt),
  index('idx_audit_logs_actor').on(table.actorUserId, table.createdAt),
])

