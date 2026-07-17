-- Cerrar listado Storage para anon (mantener URLs públicas por ruta directa).
-- Ejecutar en SQL Editor después de harden_anon.sql

DROP POLICY IF EXISTS "check_campo_storage_select" ON storage.objects;

-- Insert sigue permitido solo en carpetas del checklist
DROP POLICY IF EXISTS "check_campo_storage_insert" ON storage.objects;
CREATE POLICY "check_campo_storage_insert"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'vehicle-photos'
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp'))
  AND (name LIKE 'hallazgos/%' OR name LIKE 'general/%' OR name LIKE 'firmas/%')
);

-- Bucket público solo para servir archivos por URL conocida (no listado API).
UPDATE storage.buckets
SET public = true
WHERE id = 'vehicle-photos';
