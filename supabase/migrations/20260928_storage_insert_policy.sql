-- Recrea INSERT en vehicle-photos por si la política de anon quedó rota.
-- El upload de la app v0.35 usa service role (API); esto cubre uploads viejos.

DROP POLICY IF EXISTS "check_campo_storage_insert" ON storage.objects;

CREATE POLICY "check_campo_storage_insert"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'vehicle-photos'
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  AND (name LIKE 'hallazgos/%' OR name LIKE 'general/%' OR name LIKE 'firmas/%')
);

GRANT INSERT ON storage.objects TO anon, authenticated;
