// ============================================================
// Ítems que bloquean la operación (→ resultado "No Apto")
// ============================================================
export const BLOCKING_ITEMS = new Set([
  "Frenos",
  "Estado neumáticos",
  "Cinturones de seguridad (3 puntos / todos asientos)",
  "Dirección",
  "Luces de freno",
]);

// ============================================================
// Secciones ECF 4 / SIGO
// Cada ítem: { key, label, hint }
// ============================================================
export interface CheckItem {
  key: string;
  label: string;
  hint?: string; // Guía de foto al marcar "No"
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  items: CheckItem[];
}

export const SECTIONS: Section[] = [
  {
    id: "fotos",
    title: "Fotos exterior",
    icon: "UploadCloud",
    items: [
      {
        key: "cintas_reflectantes",
        label: "Cintas reflectantes",
        hint: "Evidencia de cinta faltante, deteriorada o con baja reflectividad en el perímetro del vehículo.",
      },
    ],
  },
  {
    id: "seguridad_activa",
    title: "Estructura y Seguridad Activa",
    icon: "Shield",
    items: [
      {
        key: "airbags",
        label: "Airbags (frontales y laterales)",
        hint: "Fotografiar el testigo (luz de advertencia) encendido en el tablero.",
      },
      {
        key: "cinturones",
        label: "Cinturones de seguridad (3 puntos / todos asientos)",
        hint: "Capturar desgaste de cinta, hebillas dañadas o pretensor activado.",
      },
      {
        key: "direccion",
        label: "Dirección",
        hint: "Capturar juego excesivo en la columna o pérdida de fluido.",
      },
    ],
  },
  {
    id: "neumaticos",
    title: "Neumáticos y Tracción",
    icon: "CircleDot",
    items: [
      {
        key: "estado_neumaticos",
        label: "Estado neumáticos",
        hint: "Evidencia de desgaste, cortes, presión baja o daño en llantas (incluye dibujo y aire).",
      },
      {
        key: "traba_tuercas",
        label: "Traba tuercas",
        hint: "Verificar presencia y correcta instalación de las traba tuercas.",
      },
      {
        key: "rueda_repuesto",
        label: "Rueda de repuesto operativa",
        hint: "Evidencia de falta de presión o daños en la llanta de auxilio.",
      },
    ],
  },
  {
    id: "visibilidad",
    title: "Visibilidad y Señalización",
    icon: "Eye",
    items: [
      {
        key: "alarma_retroceso",
        label: "Alarma de retroceso audible",
        hint: "Indicar si la alarma no suena al enganchar reversa.",
      },
      {
        key: "encendido_luces",
        label: "Luces funcionando",
        hint: "Verificar funcionamiento de las luces del vehículo.",
      },
      {
        key: "luces_freno",
        label: "Luces de freno",
        hint: "Fotografiar la luz trasera apagada al pisar el pedal de freno.",
      },
      {
        key: "parabrisas",
        label: "Parabrisas (sin trizaduras en campo visual)",
        hint: "Primer plano de trizadura u ojo de buey en el campo visual.",
      },
    ],
  },
  {
    id: "emergencia",
    title: "Equipos de Emergencia",
    icon: "AlertOctagon",
    items: [
      {
        key: "extintor",
        label: "Extintor existe",
        hint: "Verificar presencia del extintor en el vehículo.",
      },
      {
        key: "cunas",
        label: "Dos cuñas de seguridad",
        hint: "Evidencia de grietas o tamaño inadecuado para el neumático.",
      },
      {
        key: "botiquin",
        label: "Botiquín de primeros auxilios completo",
        hint: "Insumos faltantes o con fecha de vencimiento expirada.",
      },
      {
        key: "triangulos",
        label: "Triángulos de emergencia",
        hint: "Capturar daños en la estructura reflectante.",
      },
      {
        key: "chaleco_reflectante",
        label: "Chaleco reflectante",
        hint: "Deterioro de cintas reflectantes o talla incorrecta.",
      },
    ],
  },
  {
    id: "mecanica",
    title: "Mecánica y Fluidos",
    icon: "Wrench",
    items: [
      {
        key: "frenos",
        label: "Frenos",
        hint: "Fotografiar disco rayado, pastilla desgastada o pedal sin resistencia.",
      },
    ],
  },
  {
    id: "gestion_vial",
    title: "Gestión Vial / Adicionales",
    icon: "Truck",
    items: [
      {
        key: "aire_acondicionado",
        label: "C.1 Aire acondicionado / Climatizador",
        hint: "Verificar funcionamiento frío/calor con vidrios cerrados.",
      },
      {
        key: "apoya_cabezas",
        label: "C.7 Apoya-cabezas en todos los asientos",
        hint: "Verificar que cada asiento posea su apoya-cabeza de fábrica.",
      },
      {
        key: "bocina",
        label: "C.11 Bocina operativa",
        hint: "Verificar sonido audible y funcionamiento.",
      },
      {
        key: "identificacion_logos",
        label: "C.13 N° Identificación, Logotipos y Cintas",
        hint: "Cinta reflectante 4-5cm, logos laterales y número visible.",
      },
      {
        key: "gps_velocidad",
        label: "C.14 Sistema de monitoreo GPS y Velocidad",
        hint: "Transmisión en tiempo real (máx. 20 seg) y soporte técnico.",
      },
      {
        key: "barrera_carga",
        label: "C.3/C.4 Protección y Aseguramiento de Carga",
        hint: "Certificación de malla/defensa y uso de eslingas/fajas (No nylon).",
      },
      {
        key: "comunicacion_radio",
        label: "C.19/21 Radiocomunicación Bi-direccional",
        hint: "Equipo base o radio portátil según área de operación.",
      },
      {
        key: "equipamiento_mina",
        label: "C.15/16/20/24/25 Equipamiento Específico Mina",
        hint: "4x4, Diésel, Color Rojo, Foco Faenero y Cortacorriente (si aplica).",
      },
    ],
  },
  {
    id: "operacion",
    title: "Kilometraje y tablero",
    icon: "Gauge",
    items: [
      {
        key: "tablero_indicadores",
        label: "Tablero de instrumentos (sin testigos encendidos)",
        hint: "Fotografiar los testigos encendidos de forma legible.",
      },
    ],
  },
];

/** Orden UI: derecha → trasera → izquierda → frontal. Todas opcionales. */
export const GENERAL_PHOTOS = [
  "Lateral Derecho",
  "Trasera",
  "Lateral Izquierdo",
  "Frontal",
];

/** Nivel de combustible (opcional en el checklist). */
export const FUEL_LEVELS = ["1/8", "1/4", "1/2", "3/4", "FULL"] as const;
export type FuelLevel = (typeof FUEL_LEVELS)[number];

// ============================================================
// Pasos del Stepper
// Flujo: login → id usuario/vehículo → fotos → checklist → km/combustible/tablero → firma
// ============================================================
export const STEPS = [
  { id: "identificacion", label: "Identificación" },
  { id: "fotos", label: "Fotos exterior" },
  { id: "seguridad_activa", label: "Seguridad Activa" },
  { id: "neumaticos", label: "Neumáticos" },
  { id: "visibilidad", label: "Señalización" },
  { id: "emergencia", label: "Emergencia" },
  { id: "mecanica", label: "Mecánica" },
  { id: "gestion_vial", label: "Gestión Vial" },
  { id: "operacion", label: "Km y tablero" },
  { id: "cierre", label: "Cierre y Firma" },
];
