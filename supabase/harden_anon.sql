-- =============================================================================
-- Hardening: bloquear acceso directo anon/authenticated a tablas
-- Ejecutar en Supabase SQL Editor (proyecto Monitoring)
--
-- El frontend SOLO debe usar:
--   - RPC check_validate_access
--   - RPC check_submit_inspection
--   - Storage vehicle-photos (insert restringido)
-- =============================================================================

-- 1) Revocar privilegios de tabla al rol público del API
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;

-- Mantener EXECUTE solo en RPCs de campo
REVOKE ALL ON FUNCTION public.check_validate_access(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_submit_inspection(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_validate_access(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_submit_inspection(uuid, jsonb) TO anon, authenticated;

-- 2) RLS ON en tablas sensibles (y cualquier otra de public)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3) Eliminar políticas permisivas conocidas / legacy
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        policyname ILIKE '%anon%'
        OR policyname ILIKE '%allow all%'
        OR policyname ILIKE '%public%'
        OR policyname ILIKE '%select%'
        OR policyname ILIKE '%enable read%'
        OR roles::text ILIKE '%anon%'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      pol.policyname, pol.schemaname, pol.tablename
    );
  END LOOP;
END $$;

-- Asegurar tablas clave sin políticas para anon (deny-by-default)
ALTER TABLE IF EXISTS public.trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.monitoring_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.monitoring_inspection_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.check_field_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inspectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for anon" ON public.vehicles;
DROP POLICY IF EXISTS "Allow all for anon" ON public.inspectors;
DROP POLICY IF EXISTS "Allow all for anon" ON public.monitoring_inspections;
DROP POLICY IF EXISTS "Allow all for anon" ON public.monitoring_inspection_details;
DROP POLICY IF EXISTS "Allow all for anon" ON public.trabajadores;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.trabajadores;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vehicles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.monitoring_inspections;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.monitoring_inspection_details;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.check_field_sessions;

-- 4) Storage: quitar listado/lectura abierta por anon si es posible
--    (las URLs públicas del bucket siguen siendo un riesgo de diseño;
--     preferir bucket privado + signed URLs en una fase siguiente.)
DROP POLICY IF EXISTS "check_campo_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "check_campo_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_0" ON storage.objects;

-- Insert solo imágenes en vehicle-photos (necesario para el checklist)
CREATE POLICY "check_campo_storage_insert"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'vehicle-photos'
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp'))
  AND (name LIKE 'hallazgos/%' OR name LIKE 'general/%' OR name LIKE 'firmas/%')
);

-- Sin política SELECT para anon: no listar archivos por API.
-- Las fotos se sirven por URL pública conocida (bucket public = true).
-- Ver también close_storage_list.sql
