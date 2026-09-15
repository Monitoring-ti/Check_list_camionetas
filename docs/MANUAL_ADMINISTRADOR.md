# Manual del administrador — Check List Camionetas

**Aplicación de campo:** Check Flota Monitoring v0.26  
**URL para inspectores:** https://app.monitoring.lat  
**Panel de flota / historial:** sistema de administración `consulta_camionetas` (otro producto)

Este documento es para **TI, operaciones de flota y supervisión**. El inspector usa el [manual de usuario](./MANUAL_USUARIO.md).

---

## 1. Qué administra usted (y qué no)

Esta app **no tiene panel de administración**. Desde aquí el inspector solo registra la inspección.

| Usted gestiona en admin (`consulta_camionetas`) | Esta app de campo hace |
|-------------------------------------------------|-------------------------|
| Alta / baja de **trabajadores** (RUT) | Valida RUT + patente y abre el checklist |
| Alta / estado de **vehículos** (patente activa) | Guarda inspección, fotos y firma |
| Historial, reportes, documentos de flota | Envía alerta si el resultado es **No apta** |

Si un inspector no puede entrar, el arreglo casi siempre está en **trabajadores** o **vehículos**, no en la URL de la app.

---

## 2. Qué entregar al personal de terreno

1. Enlace: **https://app.monitoring.lat**
2. Que use Chrome o Safari, con cámara e internet.
3. Que esté dado de alta como trabajador y que la camioneta esté **activa**.
4. El [manual de usuario](./MANUAL_USUARIO.md) (pasos Sí/No, fotos, firma).

No entregue el alias `https://monitoring-check-campo.vercel.app` como enlace oficial. Funciona, pero el dominio de Monitoring es `app.monitoring.lat`.

No indexamos en buscadores (`noindex`). Aun así, no publique el enlace fuera del personal autorizado.

---

## 3. Requisitos para que un inspector pueda inspeccionar

La app llama a `check_validate_access(RUT, patente)`. Si falla, muestra el mensaje del servidor.

| Condición | Si falta, el inspector ve |
|-----------|---------------------------|
| RUT con dígito verificador correcto (puede ser **K**) | `RUT inválido` |
| RUT existe en **trabajadores** | `RUT no registrado en trabajadores` |
| Patente chilena válida (`AB-1234` o `ABCD-12`) | `Patente chilena inválida` |
| Vehículo existe y está **activo** | `Patente no encontrada o vehículo inactivo` |
| Internet / API | `Error de conexión. Intente nuevamente.` |

### Qué hacer usted

1. **RUT no registrado** → dar de alta al trabajador en admin (mismo RUT que usará en campo).
2. **Patente no encontrada o inactiva** → crear el vehículo o marcarlo activo; confirmar que la placa coincide (sin espacios rarios).
3. **Kilometraje rechazado al enviar** → el valor debe ser **mayor** al último km guardado de esa patente. Corrija el último km en admin si está mal cargado, o pida al inspector el odómetro real.
4. **Sesión inválida o expirada** → que vuelva a ingresar RUT y patente. No es un error de flota.

---

## 4. Qué queda registrado

Cada envío exitoso crea una inspección (Apta / No apta) con:

- Responsable (RUT, nombre, cargo)
- Patente, fecha/hora (automáticas; el inspector no las cambia)
- Ítems del checklist, descripciones y fotos de hallazgos
- Fotos de exterior (opcionales) y cintas reflectantes
- Kilometraje, combustible (opcional), testigos de tablero
- Firma

Las fotos van al bucket Supabase **`vehicle-photos`**, en carpetas `hallazgos/`, `general/` y `firmas/`.

Usted las consulta en **admin**, no en esta app.

---

## 5. Resultado Apta / No apta y alertas

| Resultado | Criterio | Acción de supervisión |
|-----------|----------|------------------------|
| **Apta** | Ningún ítem **bloqueante** en No | Revisión rutinaria en historial |
| **No apta** | Al menos un ítem bloqueante en No | El vehículo **no debe operar** hasta revisión. Llega alerta automática |

Ítems no bloqueantes en No **sí se guardan**, pero no cambian solos el resultado a No apta.

### Alerta automática (No apta)

Al enviar, el servidor notifica por **correo (Resend)** y/o **webhook**, sin abrir Gmail/WhatsApp en el teléfono.

Configuración (Vercel → Environment Variables, no en el celular):

| Variable | Obligatorio para correo | Notas |
|----------|-------------------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Sí (verifica la inspección) | **Nunca** en el frontend ni en un chat |
| `RESEND_API_KEY` | Sí | Cuenta Resend |
| `ALERT_EMAIL` | Sí | Destino (p. ej. `ti.soporte@monitoring.cl`) |
| `RESEND_FROM` | Recomendado en prod | Remitente con dominio verificado |
| `ALERT_WEBHOOK_URL` | No | Slack / Teams / Make / n8n |

Si no llega el mail:

1. Confirme que el resultado fue **No apta** y que el envío terminó en éxito.
2. En Resend, revise logs. Sin dominio verificado, Resend solo entrega al correo de la cuenta de prueba.
3. Confirme `ALERT_EMAIL` y `RESEND_FROM` en Vercel (Production).
4. Prueba de TI: `node scripts/test-resend.mjs` en un entorno con esas variables.

---

## 6. Publicar y mantener el enlace (TI)

Cadena correcta: **GitHub → Vercel**. Hostinger **solo DNS** del subdominio. No clone ni suba esta app al File Manager de Hostinger.

| Pieza | Rol |
|-------|-----|
| GitHub `Monitoring-ti/Check_list_camionetas` | Código |
| Vercel proyecto `monitoring-check-campo` | Build, HTTPS, PWA |
| Hostinger, zona `monitoring.lat` | CNAME `app` → `cname.vercel-dns.com` (o el host que muestre Vercel) |

- Dominio de producción: **https://app.monitoring.lat** (Connect to Production en Vercel, no redirect).
- Alias: `https://monitoring-check-campo.vercel.app`
- Un push a `main` republica Production.

Tras un release, compruebe en el pie de bienvenida la **versión** (hoy 1.0.9).

Variables en Vercel (Production y Preview):  
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, más las de alertas de la sección 5. Mismo proyecto Supabase que `consulta_camionetas`.

Detalle de SQL y bucket: [supabase/README.md](../supabase/README.md). Mapa técnico: [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 7. Seguridad (no negociable)

- No pegue `service_role` en el navegador, en el repo ni en tickets públicos.
- La clave **anon** del frontend solo puede usar RPCs y subir a las carpetas de fotos; no listar Storage ni leer tablas directo.
- No quite `noindex` / `X-Robots-Tag` salvo decisión expresa.
- Si alguien deja de trabajar en Monitoring, desactívelo en **trabajadores**; no hace falta cambiar la URL.

---

## 8. Problemas frecuentes (vista admin)

| Síntoma | Revisar |
|---------|---------|
| “Página por defecto” en `app.monitoring.lat` | DNS: el CNAME `app` debe ir a Vercel, sin registros A/AAAA en `app` |
| Enlace abre Vercel y cambia la URL | El dominio custom debe estar en **Connect to environment**, no redirect |
| Nadie puede entrar (todos) | Supabase caído, env vars mal en Vercel, o RPCs no aplicadas |
| Solo una persona no entra | Trabajador / vehículo en admin |
| Fotos no suben | Permiso de cámara, internet, bucket `vehicle-photos` y políticas de upload |
| No llega mail No apta | Sección 5 |
| Versión vieja en pantalla | Deploy de Vercel pendiente o caché; recargar; confirmar `main` |

No borre `@`, `www`, `mail` ni MX de `monitoring.lat` al tocar el subdominio `app`.

---

## 9. Contacto interno

- **Inspectores / proceso:** [MANUAL_USUARIO.md](./MANUAL_USUARIO.md)
- **Flota y altas:** admin `consulta_camionetas`
- **App, dominio, alertas:** Monitoring TI (`ti.soporte@monitoring.cl`)

---

*Documento para quien opera la flota y la publicación. No reemplaza el panel admin ni el manual de terreno.*
