# Monitoring Check Campo

App móvil para inspección ECF 4 de camionetas. Solo módulo de check en terreno.

## Setup

1. Ejecutar `supabase/security.sql` en el SQL Editor de Supabase.
2. Crear bucket `vehicle-photos` (público) si no existe.
3. Copiar `.env.example` → `.env.local` y completar credenciales.
4. `npm install && npm run dev`

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/check` | Ingreso RUT + patente |
| `/check/inspeccion` | Wizard de inspección |

## Seguridad

- El cliente **no** lee `trabajadores` ni `vehicles` directamente.
- Validación y envío vía RPC (`check_validate_access`, `check_submit_inspection`).
- Sesión de campo con token de 4 h, un solo envío por sesión.
- RLS activo sin políticas abiertas para `anon`.

## Variables de entorno

Solo se necesitan en el frontend (también en Vercel → Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**No usar** `service_role` en esta app.

## Deploy (Vercel)

Root Directory del proyecto: `monitoring-check-campo`

```bash
# Desde esta carpeta, con Vercel CLI logueado:
npx vercel --prod
```

O importar el repo en [vercel.com/new](https://vercel.com/new) y setear:
- Framework: Next.js
- Root Directory: `monitoring-check-campo`
- Env vars: las dos `NEXT_PUBLIC_*` de arriba
