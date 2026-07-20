# Changelog

## 1.0.4 — 2026-07-20

- Checklist: **Estado neumáticos** (reemplaza dibujo + aire); sin ítem batería
- Alerta automática por correo en **No apta** → `joseluis.urra@monitoring.cl`
- WhatsApp opcional vía `NEXT_PUBLIC_ALERT_WHATSAPP`

## 1.0.3 — 2026-07-20

- RUT manual otra vez (sin DV automático)
- Validación de formato con soporte correcto para DV **K**

## 1.0.2 — 2026-07-20

- RUT con dígito verificador automático al escribir el número
- Manual de usuario (`docs/MANUAL_USUARIO.md`)

## 1.0.1 — 2026-07-20

- Las fotos de hallazgo (ítem en **No**) se suben y guardan de inmediato en Storage
- Feedback UI: Guardando / Foto guardada / error
- Helper `src/lib/uploadPhoto.ts`
- Docs de arquitectura y orden SQL para seguir desarrollando

## 1.0.0 — 2026-07-17

- App unificada en la raíz del repo (sin carpetas legacy)
- UI Field Ops Sentinel (bienvenida, identificación, checklist)
- Seguridad: noindex, harden anon, cierre listado Storage
- Flujo RUT + patente, fotos generales opcionales, Apta / No apta
