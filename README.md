# Check List Camionetas — Monitoring Check Campo

Checklist ECF 4 / SIGO para inspección de camionetas en terreno. **Sin panel de administración.**

**Versión:** `1.0.3` · [Changelog](./CHANGELOG.md) · [Arquitectura](./docs/ARCHITECTURE.md) · [Manual de usuario](./docs/MANUAL_USUARIO.md)

## Qué hace

- Bienvenida + acceso con **RUT + patente**
- Wizard ECF 4 / SIGO
- Fotos generales **opcionales**
- Hallazgos: descripción + foto (se **guarda al tomarla**)
- Firma y resultado Apta / No apta
- UI Field Ops Sentinel (Monitoring / Stitch)

## Qué no hace

- No gestiona flota ni documentos
- No tiene panel admin → `consulta_camionetas`

## Setup local

1. SQL en Supabase (ver [supabase/README.md](./supabase/README.md)).
2. Bucket `vehicle-photos`.
3. `.env.example` → `.env.local` con URL + anon/publishable key.
4. `npm install && npm run dev` → http://localhost:3000

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Bienvenida |
| `/check` | Identificación RUT + patente |
| `/check/inspeccion` | Wizard |

## Deploy (Vercel)

- Repo: `Monitoring-ti/Check_list_camionetas`
- **Root Directory:** `.` (raíz)
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Prod: https://monitoring-check-campo.vercel.app

## Seguridad (resumen)

- No indexar (robots + noindex + `X-Robots-Tag`)
- Anon **sin** lectura/escritura de tablas; solo RPCs
- Storage: upload en `hallazgos|general|firmas`; sin listado API
- Nunca `service_role` en el frontend

Detalle: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Continuar desarrollo

1. Leer [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) (mapa + dónde tocar).
2. Bump `src/lib/version.ts` + entrada en `CHANGELOG.md`.
3. Si hay SQL nuevo: agregarlo a `supabase/` y actualizar `supabase/README.md`.
