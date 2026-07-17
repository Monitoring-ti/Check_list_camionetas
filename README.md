# Check List Camionetas — Monitoring Check Campo

Checklist ECF 4 / SIGO para inspección de camionetas en terreno. Sin panel de administración.

**Versión:** `1.0.0`

## Qué hace

- Pantalla de bienvenida + acceso con **RUT + patente**
- Wizard de inspección ECF 4 / SIGO
- Fotos generales **opcionales**, hallazgos con evidencia, firma, resultado Apta / No apta
- UI Field Ops Sentinel (Monitoring / Stitch)

## Qué no hace

- No gestiona flota ni documentos
- No tiene panel admin (eso vive en `consulta_camionetas`)

## Setup local

1. Ejecutar `supabase/security.sql` en el SQL Editor de Supabase (proyecto Monitoring compartido).
2. Bucket Storage `vehicle-photos` (lectura pública; escritura vía políticas del SQL).
3. Copiar `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # o sb_publishable_...
```

4. `npm install && npm run dev` → http://localhost:3000

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Bienvenida |
| `/check` | Identificación RUT + patente |
| `/check/inspeccion` | Wizard de checklist |

## Deploy en Vercel

1. Proyecto: conectar repo `Monitoring-ti/Check_list_camionetas`
2. **Root Directory:** `.` (raíz del repo — ya no `monitoring-check-campo`)
3. Framework: Next.js (detectado por `vercel.json`)
4. Variables de entorno (Production + Preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key o publishable key |

5. Deploy. Prod actual: https://monitoring-check-campo.vercel.app

### Checklist post-deploy

- [ ] Abrir `/` → bienvenida
- [ ] `/check` → validar RUT + patente reales
- [ ] Completar inspección y ver resultado en admin (`consulta_camionetas`)

## Seguridad

- **Google / buscadores:** `robots.txt` Disallow `/` + metadata `noindex` + header `X-Robots-Tag`.
- **Base de datos:** el cliente **no** debe leer tablas. Solo RPCs `check_validate_access` y `check_submit_inspection`.
- Ejecutar en Supabase (en orden):
  1. `supabase/security.sql`
  2. `supabase/harden_anon.sql`
  3. `supabase/close_storage_list.sql` ← bloquea listado de fotos por API
- **Nunca** poner `service_role` en el frontend ni en Vercel públicas.
- Storage `vehicle-photos`: upload solo en `hallazgos/`, `general/`, `firmas/`. Sin listado anon; URLs solo por ruta conocida.

## Arquitectura

Comparte la misma base Supabase que el módulo de administración (`consulta_camionetas`). El cliente solo llama RPCs `check_validate_access` y `check_submit_inspection` (sin lectura directa de tablas).
