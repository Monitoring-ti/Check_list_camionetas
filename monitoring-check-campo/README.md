# Monitoring Check Campo — Checklist ECF 4

**Único módulo de checklist** para vehículos/camionetas. Sin administración.

## Qué hace

- Ingreso con **RUT + patente**
- Wizard de inspección ECF 4 / SIGO
- Fotos, hallazgos, firma, resultado Apto / No Apto

## Qué no hace

- No gestiona flota ni documentos
- No tiene panel admin (eso es `../control_vehiculos`)

## Setup

1. Ejecutar `supabase/security.sql` en Supabase.
2. Bucket `vehicle-photos` (público lectura).
3. `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `npm install && npm run dev` → http://localhost:3000

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/check` | Acceso RUT + patente |
| `/check/inspeccion` | Checklist |

## Versión

`0.7.3` — ver `src/lib/version.ts`

## Deploy

Root Directory Vercel: `monitoring-check-campo`  
Prod: https://monitoring-check-campo.vercel.app

## Arquitectura

Ver `../README.md` (checklist vs control de vehículos).
