\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  category_id uuid;
  user_id uuid;
  trend_id uuid;
  config_id uuid;
BEGIN
  INSERT INTO categories (name, slug, description)
  VALUES ('Preflight', 'preflight-integrity', 'Datos transitorios de verificacion')
  RETURNING id INTO category_id;

  INSERT INTO users (name, email, password_hash, role)
  VALUES ('Preflight Analyst', 'preflight@trendia.local', 'not-a-real-password', 'ANALYST')
  RETURNING id INTO user_id;

  INSERT INTO trends (category_id, title, slug, summary, origin_country, created_by)
  VALUES (
    category_id, 'Tendencia de preflight', 'tendencia-preflight',
    'Solo existe durante la transaccion de verificacion.', 'KR', user_id
  ) RETURNING id INTO trend_id;

  BEGIN
    INSERT INTO scoring_configs (
      category_id, name, version, international_growth_weight, local_interest_weight,
      competitive_attractiveness_weight, investment_accessibility_weight,
      implementation_ease_weight, viral_potential_weight
    ) VALUES (
      category_id, 'Pesos invalidos', 999, 20, 25, 15, 10, 15, 14
    );
    RAISE EXCEPTION 'FAIL: PostgreSQL acepto pesos que no suman 100';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'PASS: pesos invalidos rechazados';
  END;

  INSERT INTO scoring_configs (
    category_id, name, version, international_growth_weight, local_interest_weight,
    competitive_attractiveness_weight, investment_accessibility_weight,
    implementation_ease_weight, viral_potential_weight, is_active
  ) VALUES (
    category_id, 'Tecnologia MVP v1', 1, 20, 25, 15, 10, 15, 15, true
  ) RETURNING id INTO config_id;

  BEGIN
    UPDATE trends
    SET status = 'PUBLISHED', published_at = now()
    WHERE id = trend_id;
    RAISE EXCEPTION 'FAIL: PostgreSQL publico una tendencia sin fuente';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'PASS: publicacion sin fuente rechazada';
  END;

  INSERT INTO trend_sources (
    trend_id, type, title, url, consulted_at, evidence_note
  ) VALUES (
    trend_id, 'OPEN_DATA', 'Fuente autorizada de preflight',
    'https://example.test/preflight', current_date, 'Evidencia transitoria'
  );

  UPDATE trends
  SET status = 'PUBLISHED', published_at = now()
  WHERE id = trend_id;
  RAISE NOTICE 'PASS: tendencia con fuente publicada';

  BEGIN
    INSERT INTO opportunity_evaluations (
      trend_id, scoring_config_id, international_growth_score, local_interest_score,
      competitive_attractiveness_score, investment_accessibility_score,
      implementation_ease_score, viral_potential_score, total_score, level,
      justifications, evaluated_by
    ) VALUES (
      trend_id, config_id, 80, 80, 80, 80, 80, 80, 79, 'HIGH', '{}', user_id
    );
    RAISE EXCEPTION 'FAIL: PostgreSQL acepto un total manipulado';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'PASS: total manipulado rechazado';
  END;

  INSERT INTO opportunity_evaluations (
    trend_id, scoring_config_id, international_growth_score, local_interest_score,
    competitive_attractiveness_score, investment_accessibility_score,
    implementation_ease_score, viral_potential_score, total_score, level,
    justifications, evaluated_by
  ) VALUES (
    trend_id, config_id, 80, 80, 80, 80, 80, 80, 80, 'HIGH', '{}', user_id
  );
  RAISE NOTICE 'PASS: evaluacion valida aceptada';
END $$;

ROLLBACK;

SELECT 'PASS: migracion e integridad de negocio verificadas' AS result;
