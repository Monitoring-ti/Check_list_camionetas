# Manual de usuario — Check List Camionetas

**Aplicación:** Monitoring Check Campo (Check ECF 4)  
**Versión:** 1.0.3  
**Uso:** Inspección preoperacional de camionetas en terreno

---

## 1. ¿Para qué sirve?

Permite registrar una inspección de seguridad de una camioneta:

1. Identificarse con **RUT** y **patente**
2. Revisar ítems del checklist (Sí / No)
3. Adjuntar evidencia si algo está mal
4. Firmar y enviar el resultado (**Apta** o **No apta**)

No incluye administración de flota ni historial: eso se consulta en el sistema de administración de Monitoring.

---

## 2. Requisitos

- Celular o tablet con navegador (Chrome / Safari recomendados)
- Conexión a internet
- Cámara (para fotos de hallazgos y, si desea, fotos generales)
- Estar registrado como **trabajador** en Monitoring
- Que la **patente** exista y el vehículo esté **activo**

---

## 3. Inicio

1. Abra la dirección de la aplicación (la que le entregue Monitoring).
2. En la pantalla de bienvenida pulse **Comenzar inspección**.

---

## 4. Identificación (RUT + patente)

1. Ingrese su **RUT** completo, incluido el dígito verificador (puede ser **K**).  
   Ejemplo: `12.345.678-5` o `12.345.678-K`.
2. Ingrese la **patente** del vehículo:
   - Formato antiguo: `AB-1234`
   - Formato nuevo: `ABCD-12`
3. Pulse **Continuar**.

### Mensajes frecuentes

| Mensaje | Qué hacer |
|---------|-----------|
| RUT inválido | Revise dígito verificador y formato |
| RUT no registrado | Solicite alta como trabajador en Monitoring |
| Patente no encontrada o inactiva | Verifique la placa o active el vehículo en admin |
| Error de conexión | Revise internet e intente de nuevo |

Si entra con un código QR de la camioneta, la patente puede venir precargada: complete solo el RUT.

---

## 5. Pasos de la inspección

Use **Anterior** / **Siguiente** o el listado superior de pasos. No podrá avanzar un paso hasta completar lo obligatorio.

### 5.1 Identificación (datos de la unidad)

Se muestran responsable y vehículo (solo lectura). Complete:

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| Fecha / Hora | — | Automáticas |
| Kilometraje | Sí | Debe ser **mayor** al último registrado |
| Nivel de combustible | No | 1/8, 1/4, 1/2, 3/4, FULL |
| Inspección Gestión Vial | No | Active el interruptor solo si aplica faena / requisitos adicionales |

### 5.2 Secciones del checklist

En cada ítem elija:

- **Sí** — cumple / en buen estado  
- **No** — no cumple / con falla  

Si marca **No**:

1. Escriba una **descripción** del hallazgo (obligatorio).
2. Tome una **foto** (obligatorio). Espere el mensaje **Foto guardada**.
3. Si el ítem es **bloqueante**, el resultado final será **No apta**.

Ítems bloqueantes (ejemplos): frenos, luces de freno, cinturones, dirección, profundidad de dibujo.

Secciones habituales:

1. Seguridad Activa  
2. Neumáticos  
3. Señalización (visibilidad)  
4. Emergencia  
5. Mecánica  
6. Gestión Vial *(solo si la activó al inicio)*

### 5.3 Fotos generales

**Opcionales.** Puede omitirlas o cargar:

- Lateral izquierdo  
- Trasera  
- Lateral derecho  
- Frontal  

### 5.4 Cierre y firma

1. Revise el resultado: **Apta** o **No apta**.
2. Observaciones (opcional).
3. **Firma digital** en el recuadro (obligatorio). Use **Limpiar** si necesita rehacerla.
4. Marque la casilla de declaración de veracidad.
5. Pulse **Enviar inspección**.

Al confirmar verá un mensaje de éxito. Luego volverá a la pantalla de identificación para una nueva inspección.

---

## 6. Consejos en terreno

- Ubique el vehículo en superficie nivelada antes de empezar.
- Use buena iluminación al fotografiar hallazgos.
- No cierre el navegador a mitad del envío.
- Si pierde la sesión (tiempo o “Salir”), vuelva a ingresar RUT y patente.
- La sesión de acceso tiene vigencia limitada (horas); si expira, reinicie el acceso.

---

## 7. Resultado Apta / No apta

| Resultado | Significado |
|-----------|-------------|
| **Apta** | No hay fallas en ítems bloqueantes |
| **No apta** | Hay al menos un ítem bloqueante en **No**. El vehículo no debe operar hasta revisión |

Una falla en un ítem no bloqueante queda registrada, pero no cambia sola el resultado a No apta.

---

## 8. Problemas frecuentes

| Situación | Solución |
|-----------|----------|
| No avanza al siguiente paso | Complete campos marcados; en hallazgos espere “Foto guardada” |
| No se puede enviar | Firme, acepte la declaración y revise pasos incompletos |
| Foto no guarda | Permita cámara y reintente; verifique internet |
| App pide de nuevo RUT y patente | Sesión vencida o inválida; vuelva a identificarse |
| Kilometraje rechazado | Debe ser mayor al último valor del vehículo |

---

## 9. Privacidad y uso correcto

- Use solo datos reales de la inspección.
- No comparta la dirección de la app fuera del personal autorizado.
- Las fotos y la firma quedan asociadas a la inspección en Monitoring.

---

## 10. Soporte

Ante altas de personal/vehículos, errores de patente o dudas del proceso, contacte al equipo **Monitoring — Gestión de Activos** (TI / operaciones de flota).

---

*Documento orientado al inspector en terreno. Detalle técnico: [ARCHITECTURE.md](./ARCHITECTURE.md).*
