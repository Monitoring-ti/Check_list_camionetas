# Supabase — scripts de este repo

Proyecto compartido con `consulta_camionetas`. Ejecutar en el **SQL Editor** en este orden (solo la primera vez o al endurecer):

| Orden | Archivo | Qué hace |
|------:|---------|----------|
| 1 | `security.sql` | Helpers, sesiones, RPCs `check_validate_*` / `check_submit_*`, RLS base, storage insert |
| 2 | `harden_anon.sql` | Revoca acceso directo de `anon` a tablas; fuerza RLS |
| 3 | `close_storage_list.sql` | Quita listado de Storage por API para anon |

Migraciones incrementales: carpeta `migrations/` (ej. `nivel_combustible`).

## RPCs usadas por la app

- `check_validate_access(p_rut, p_patente)` → sesión de campo
- `check_submit_inspection(p_session_token, p_payload)` → guarda inspección + detalles

## Storage

Bucket: `vehicle-photos`  
Prefijos permitidos para upload anon: `hallazgos/`, `general/`, `firmas/`
