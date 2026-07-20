# Arquitectura — Check List Camionetas

App de campo (Next.js) para inspecciones ECF 4. **Sin admin.** Admin: repo `consulta_camionetas`.

## Mapa del código

```
src/
  app/                    # Rutas App Router
    page.tsx              # Bienvenida
    check/page.tsx        # Identificación RUT + patente
    check/inspeccion/     # Wizard checklist
  components/             # UI de flujo
    WelcomeScreen.tsx
    AccessGate.tsx
    ChecklistWizard.tsx   # Núcleo del checklist + envío
    FaultPhoto.tsx        # Foto hallazgo (sube al marcar No)
    SignatureCanvas.tsx
    AppHeader.tsx
  lib/                    # Dominio y clientes
    checklistData.ts      # Ítems ECF 4 / pasos / bloqueantes
    checkSession.ts       # Sesión de campo (localStorage)
    uploadPhoto.ts        # Upload Storage hallazgos/general/firmas
    rut.ts / patente.ts
    supabase.ts           # Cliente anon (solo RPCs + storage)
    version.ts            # APP_VERSION — bump en cada release
supabase/
  security.sql            # RPCs + RLS base
  harden_anon.sql         # Revoca SELECT/INSERT tablas a anon
  close_storage_list.sql  # Sin listado Storage por API
  migrations/             # Cambios incrementales de esquema
```

## Flujo de datos

1. `/check` → RPC `check_validate_access(rut, patente)` → token de sesión
2. Wizard → fotos de hallazgo se suben **al tomarlas** (`uploadPhoto` → `vehicle-photos/hallazgos/`)
3. Enviar → RPC `check_submit_inspection(token, payload)` con URLs ya guardadas
4. Admin lee inspecciones con **service_role** (otro repo)

## Cómo agregar funciones nuevas

| Tipo de cambio | Dónde tocar |
|----------------|-------------|
| Nuevo ítem / sección checklist | `src/lib/checklistData.ts` |
| Nueva pantalla / paso UI | `src/components/` + `STEPS` en checklistData |
| Validación de acceso | RPC en `supabase/` + `AccessGate.tsx` |
| Campos al guardar inspección | RPC `check_submit_inspection` + payload en `ChecklistWizard.tsx` |
| Alertas No apta (correo / WhatsApp) | `src/lib/alerts.ts` + env `NEXT_PUBLIC_ALERT_*` |
| Estilos / design system | `src/app/globals.css` (tokens Field Ops Sentinel) |
| Versionado | `src/lib/version.ts` + `package.json` + `CHANGELOG.md` |

## Reglas de seguridad (no romper)

- El frontend **nunca** hace `.from('tabla').select/insert`
- Solo RPCs + Storage en carpetas permitidas
- No subir `service_role` ni `.env.local`
- Tras SQL nuevo: documentar en `supabase/README.md` el orden de ejecución

## Design system

Tokens Stitch **Field Ops Sentinel**: navy `#142275`, acción `#f28c28`, superficies `#f8f9fb`, bordes sobre sombras, touch ≥ 48px.
