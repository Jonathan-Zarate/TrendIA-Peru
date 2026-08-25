CREATE TYPE "public"."analysis_status" AS ENUM('GENERATED', 'REVIEWED', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."opportunity_level" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('OPEN_DATA', 'SEARCH_TRENDS', 'ARTICLE', 'RESEARCH', 'SURVEY', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."trend_status" AS ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'ANALYST', 'ENTREPRENEUR');--> statement-breakpoint
CREATE TABLE "ai_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trend_id" uuid NOT NULL,
	"evaluation_id" uuid,
	"requested_by" uuid NOT NULL,
	"provider" varchar(80) NOT NULL,
	"model" varchar(120) NOT NULL,
	"prompt_version" varchar(40) NOT NULL,
	"content" jsonb NOT NULL,
	"raw_response" jsonb NOT NULL,
	"status" "analysis_status" DEFAULT 'GENERATED' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_ai_analyses_human_review" CHECK ("ai_analyses"."status" = 'GENERATED' or ("ai_analyses"."reviewed_by" is not null and "ai_analyses"."reviewed_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"request_id" varchar(120),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "opportunity_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trend_id" uuid NOT NULL,
	"scoring_config_id" uuid NOT NULL,
	"international_growth_score" smallint NOT NULL,
	"local_interest_score" smallint NOT NULL,
	"competitive_attractiveness_score" smallint NOT NULL,
	"investment_accessibility_score" smallint NOT NULL,
	"implementation_ease_score" smallint NOT NULL,
	"viral_potential_score" smallint NOT NULL,
	"total_score" numeric(5, 2) NOT NULL,
	"level" "opportunity_level" NOT NULL,
	"justifications" jsonb NOT NULL,
	"evaluated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_opportunity_evaluations_international_growth" CHECK ("opportunity_evaluations"."international_growth_score" between 0 and 100),
	CONSTRAINT "ck_opportunity_evaluations_local_interest" CHECK ("opportunity_evaluations"."local_interest_score" between 0 and 100),
	CONSTRAINT "ck_opportunity_evaluations_competitive" CHECK ("opportunity_evaluations"."competitive_attractiveness_score" between 0 and 100),
	CONSTRAINT "ck_opportunity_evaluations_investment" CHECK ("opportunity_evaluations"."investment_accessibility_score" between 0 and 100),
	CONSTRAINT "ck_opportunity_evaluations_implementation" CHECK ("opportunity_evaluations"."implementation_ease_score" between 0 and 100),
	CONSTRAINT "ck_opportunity_evaluations_viral" CHECK ("opportunity_evaluations"."viral_potential_score" between 0 and 100),
	CONSTRAINT "ck_opportunity_evaluations_total" CHECK ("opportunity_evaluations"."total_score" between 0 and 100),
	CONSTRAINT "ck_opportunity_evaluations_level" CHECK (("opportunity_evaluations"."total_score" < 40 and "opportunity_evaluations"."level" = 'LOW') or ("opportunity_evaluations"."total_score" >= 40 and "opportunity_evaluations"."total_score" < 70 and "opportunity_evaluations"."level" = 'MEDIUM') or ("opportunity_evaluations"."total_score" >= 70 and "opportunity_evaluations"."level" = 'HIGH'))
);
--> statement-breakpoint
CREATE TABLE "scoring_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"version" integer NOT NULL,
	"international_growth_weight" smallint NOT NULL,
	"local_interest_weight" smallint NOT NULL,
	"competitive_attractiveness_weight" smallint NOT NULL,
	"investment_accessibility_weight" smallint NOT NULL,
	"implementation_ease_weight" smallint NOT NULL,
	"viral_potential_weight" smallint NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_scoring_configs_positive_version" CHECK ("scoring_configs"."version" > 0),
	CONSTRAINT "ck_scoring_configs_international_growth_weight" CHECK ("scoring_configs"."international_growth_weight" between 0 and 100),
	CONSTRAINT "ck_scoring_configs_local_interest_weight" CHECK ("scoring_configs"."local_interest_weight" between 0 and 100),
	CONSTRAINT "ck_scoring_configs_competitive_weight" CHECK ("scoring_configs"."competitive_attractiveness_weight" between 0 and 100),
	CONSTRAINT "ck_scoring_configs_investment_weight" CHECK ("scoring_configs"."investment_accessibility_weight" between 0 and 100),
	CONSTRAINT "ck_scoring_configs_implementation_weight" CHECK ("scoring_configs"."implementation_ease_weight" between 0 and 100),
	CONSTRAINT "ck_scoring_configs_viral_weight" CHECK ("scoring_configs"."viral_potential_weight" between 0 and 100),
	CONSTRAINT "ck_scoring_configs_weights_sum_100" CHECK ("scoring_configs"."international_growth_weight" + "scoring_configs"."local_interest_weight" + "scoring_configs"."competitive_attractiveness_weight" + "scoring_configs"."investment_accessibility_weight" + "scoring_configs"."implementation_ease_weight" + "scoring_configs"."viral_potential_weight" = 100)
);
--> statement-breakpoint
CREATE TABLE "trend_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trend_id" uuid NOT NULL,
	"type" "source_type" NOT NULL,
	"title" varchar(300) NOT NULL,
	"url" text NOT NULL,
	"publisher" varchar(180),
	"published_at" date,
	"consulted_at" date NOT NULL,
	"evidence_note" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" varchar(220) NOT NULL,
	"slug" varchar(240) NOT NULL,
	"summary" text NOT NULL,
	"origin_country" char(2) NOT NULL,
	"origin_region" varchar(120),
	"status" "trend_status" DEFAULT 'DRAFT' NOT NULL,
	"observation_started_at" date,
	"observation_ended_at" date,
	"created_by" uuid NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trends_slug_unique" UNIQUE("slug"),
	CONSTRAINT "ck_trends_origin_country_uppercase" CHECK ("trends"."origin_country" = upper("trends"."origin_country")),
	CONSTRAINT "ck_trends_observation_window" CHECK ("trends"."observation_started_at" is null or "trends"."observation_ended_at" is null or "trends"."observation_ended_at" >= "trends"."observation_started_at"),
	CONSTRAINT "ck_trends_publication_timestamp" CHECK (("trends"."status" = 'PUBLISHED' and "trends"."published_at" is not null) or ("trends"."status" <> 'PUBLISHED'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"failed_login_attempts" smallint DEFAULT 0 NOT NULL,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "ck_users_failed_attempts_nonnegative" CHECK ("users"."failed_login_attempts" >= 0),
	CONSTRAINT "ck_users_email_normalized" CHECK ("users"."email" = lower("users"."email"))
);
--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_trend_id_trends_id_fk" FOREIGN KEY ("trend_id") REFERENCES "public"."trends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_evaluation_id_opportunity_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."opportunity_evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evaluations" ADD CONSTRAINT "opportunity_evaluations_trend_id_trends_id_fk" FOREIGN KEY ("trend_id") REFERENCES "public"."trends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evaluations" ADD CONSTRAINT "opportunity_evaluations_scoring_config_id_scoring_configs_id_fk" FOREIGN KEY ("scoring_config_id") REFERENCES "public"."scoring_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_evaluations" ADD CONSTRAINT "opportunity_evaluations_evaluated_by_users_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scoring_configs" ADD CONSTRAINT "scoring_configs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_sources" ADD CONSTRAINT "trend_sources_trend_id_trends_id_fk" FOREIGN KEY ("trend_id") REFERENCES "public"."trends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trends" ADD CONSTRAINT "trends_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trends" ADD CONSTRAINT "trends_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_analyses_trend_created" ON "ai_analyses" USING btree ("trend_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor" ON "audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_opportunity_evaluations_trend_created" ON "opportunity_evaluations" USING btree ("trend_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_scoring_configs_category_version" ON "scoring_configs" USING btree ("category_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_scoring_configs_one_active_per_category" ON "scoring_configs" USING btree ("category_id") WHERE "scoring_configs"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_trend_sources_trend_url" ON "trend_sources" USING btree ("trend_id","url");--> statement-breakpoint
CREATE INDEX "idx_trend_sources_trend" ON "trend_sources" USING btree ("trend_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_trends_catalog" ON "trends" USING btree ("status","category_id","created_at");--> statement-breakpoint
CREATE OR REPLACE FUNCTION validate_opportunity_evaluation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  config scoring_configs%ROWTYPE;
  trend_category_id uuid;
  expected_total numeric(5,2);
BEGIN
  SELECT * INTO config
  FROM scoring_configs
  WHERE id = NEW.scoring_config_id;

  SELECT category_id INTO trend_category_id
  FROM trends
  WHERE id = NEW.trend_id;

  IF config.category_id <> trend_category_id THEN
    RAISE EXCEPTION 'La configuracion y la tendencia pertenecen a categorias distintas'
      USING ERRCODE = 'check_violation';
  END IF;

  expected_total := round((
    NEW.international_growth_score * config.international_growth_weight
    + NEW.local_interest_score * config.local_interest_weight
    + NEW.competitive_attractiveness_score * config.competitive_attractiveness_weight
    + NEW.investment_accessibility_score * config.investment_accessibility_weight
    + NEW.implementation_ease_score * config.implementation_ease_weight
    + NEW.viral_potential_score * config.viral_potential_weight
  ) / 100.0, 2);

  IF NEW.total_score <> expected_total THEN
    RAISE EXCEPTION 'Indice inconsistente: esperado %, recibido %', expected_total, NEW.total_score
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER trg_validate_opportunity_evaluation
BEFORE INSERT OR UPDATE ON opportunity_evaluations
FOR EACH ROW EXECUTE FUNCTION validate_opportunity_evaluation();--> statement-breakpoint
CREATE OR REPLACE FUNCTION require_source_before_publish()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'PUBLISHED' AND NOT EXISTS (
    SELECT 1
    FROM trend_sources
    WHERE trend_id = NEW.id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Una tendencia publicada requiere al menos una fuente activa'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER trg_require_source_before_publish
BEFORE INSERT OR UPDATE OF status ON trends
FOR EACH ROW EXECUTE FUNCTION require_source_before_publish();
