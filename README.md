# Check List Camionetas — Monitoring Check Campo

Checklist ECF 4 / SIGO para inspección de camionetas en terreno. **Sin panel de administración.**

**Versión:** `0.31` · [Changelog](./CHANGELOG.md) · [Arquitectura](./docs/ARCHITECTURE.md) · [Manual de usuario](./docs/MANUAL_USUARIO.md) · [Manual del administrador](./docs/MANUAL_ADMINISTRADOR.md)

**Campo:** https://app.monitoring.lat

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
4. Alertas No apta: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ALERT_EMAIL` (ver abajo).
5. `npm install && npm run dev` → http://localhost:3000

### Alertas No apta (Resend)

Variables **solo servidor** (`.env.local` y Vercel):

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Mismo proyecto Supabase (Settings → API) |
| `RESEND_API_KEY` | API key de [resend.com](https://resend.com) |
| `ALERT_EMAIL` | Destino (default: `joseluis.urra@monitoring.cl`) |
| `RESEND_FROM` | Remitente: `Check <noreply@app.monitoring.lat>` |

Probar Resend localmente:

```bash
node scripts/test-resend.mjs
```

Sin dominio verificado, Resend solo envía al email de tu cuenta de prueba. Verifica `monitoring.cl` en Resend para producción.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Bienvenida |
| `/check` | Identificación RUT + patente |
| `/check/inspeccion` | Wizard |

## Deploy (Vercel)

- Repo: `Monitoring-ti/Check_list_camionetas`
- **Root Directory:** `.` (raíz)
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ALERT_EMAIL`
- Opcional: `RESEND_FROM` (dominio verificado en Resend)
- **Prod (oficial):** https://app.monitoring.lat
- Alias Vercel: https://monitoring-check-campo.vercel.app

### Dominio `app.monitoring.lat`

Subdominio de `monitoring.lat` (DNS en Hostinger) apuntando a este proyecto Vercel:

| DNS (Hostinger) | Valor |
|-----------------|-------|
| CNAME `app` | `cname.vercel-dns.com` (o el host que muestre Vercel) |

No desplegar esta app en Hostinger. GitHub → Vercel; Hostinger solo DNS.

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
