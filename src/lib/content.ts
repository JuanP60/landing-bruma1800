/**
 * Fuente única de verdad para todo el copy, precios y links de la landing.
 *
 * Todo dato aquí sale verbatim del handoff congelado (design_handoff_landing/
 * y dist/index.html del proyecto original) o de CLAUDE.md. No inventar
 * cifras, nombres de fincas ni testimonios — regla de marca, ver
 * bruma1800-landing/CLAUDE.md §"Hechos verificados".
 */

export const WHATSAPP_NUMBER = "573152103231";
export const INSTAGRAM_HANDLE = "bruma1800_cafe";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const whatsappLinks = {
  hero: waLink("Hola BRUMA1800, quiero pedir café"),
  esencial: waLink("Hola, quiero pedir Esencial"),
  origen70: waLink("Hola, quiero pedir Origen 70"),
  drip: waLink("Hola, quiero pedir Drip Coffee"),
  aguijon: waLink("Avísenme cuando salga Aguijón"),
  portafolioCierre: waLink("Hola, ¿cuál lote está en su punto?"),
  ctaFinal: waLink("Hola BRUMA1800"),
};

export const hero = {
  eyebrow: "Finca familiar · Pijao, Quindío · 1.800 m.s.n.m.",
  script: "de la finca a su taza",
  title: "Café y miel de la misma montaña",
  lede: "Las abejas de la finca polinizan los cafetales en floración. De ese mismo ciclo salen nuestro café y nuestra miel picante.",
  ctaPrimary: "Escríbenos por WhatsApp",
  ctaSecondary: "Ver el portafolio",
};

export const ciclo = [
  {
    num: "01",
    title: "Floración",
    text: "El cafetal florece una vez y marca el calendario de todo el año.",
  },
  {
    num: "02",
    title: "Polinización",
    text: "Las abejas de la finca hacen el trabajo que nadie ve, y de ahí sale la miel.",
  },
  {
    num: "03",
    title: "Cosecha",
    text: "Café y miel salen del mismo terreno, en la misma temporada.",
  },
] as const;

export const origen = {
  eyebrow: "De dónde viene",
  title: "DOS FINCAS, DOS FAMILIAS, UN MISMO ORIGEN",
  paragraphs: [
    "La <strong>Finca La Cubana</strong> y la <strong>Finca El Retiro</strong> están en Pijao, Quindío, a 1.800 metros sobre el nivel del mar. Detrás están las familias <strong>Osorio</strong> y <strong>Restrepo</strong>, y más de cien años de trabajo que todavía dan fruto.",
    "Variedad Castillo, procesos lavado y fermentación controlada. Cada cambio se prueba en pequeña escala, se documenta y se valida en taza antes de llegar al lote completo.",
  ],
  datos: [
    { num: "1.800", label: "metros sobre el nivel del mar" },
    { num: "CASTILLO", label: "variedad sembrada en las dos fincas" },
    { num: "PIJAO", label: "Quindío, Colombia" },
  ],
};

export type CardId = "esencial" | "origen70" | "drip";

export const cards: Array<{
  id: CardId;
  kicker: string;
  title: string;
  desc: string;
  precios: Array<{ label: string; value: string }>;
  whatsapp: string;
  image: string;
  imageAlt: string;
}> = [
  {
    id: "esencial",
    kicker: "Café · línea core",
    title: "ESENCIAL",
    desc: "Dulce, limpio y balanceado, con notas a panela. El café de todos los días.",
    precios: [
      { label: "250 g", value: "$22.000 COP" },
      { label: "500 g", value: "$40.000 COP" },
      { label: "2.500 g", value: "$150.000 COP" },
    ],
    whatsapp: whatsappLinks.esencial,
    image: "/images/products/esencial.webp",
    imageAlt: "Bolsa de café Esencial de BRUMA1800",
  },
  {
    id: "origen70",
    kicker: "Café · mayor valor",
    title: "ORIGEN 70",
    desc: "Fermentación de 70 horas: taza sedosa, con panela y chocolate. 87.5 puntos en protocolo SCA.",
    precios: [
      { label: "250 g", value: "$28.000 COP" },
      { label: "340 g", value: "$40.000 COP" },
      { label: "500 g", value: "$50.000 COP" },
      { label: "2.500 g", value: "$190.000 COP" },
    ],
    whatsapp: whatsappLinks.origen70,
    image: "/images/products/origen70.webp",
    imageAlt: "Bolsa de café Origen 70 de BRUMA1800",
  },
  {
    id: "drip",
    kicker: "Café · portátil",
    title: "DRIP COFFEE",
    desc: "El mismo café de la finca en formato de viaje. Solo necesita agua caliente.",
    precios: [
      { label: "Unidad", value: "$4.000 COP" },
      { label: "Paquete x7", value: "$24.500 COP" },
      { label: "Paquete x10", value: "$30.000 COP" },
    ],
    whatsapp: whatsappLinks.drip,
    image: "/images/products/drip.webp",
    imageAlt: "Sachets de Drip Coffee de BRUMA1800",
  },
];

export const aguijon = {
  eyebrow: "Miel picante · pre-lanzamiento",
  title: "Aguijón",
  desc: "Tres intensidades nombradas por casta, en frascos de 130 g. De las mismas abejas que polinizan el cafetal.",
  precio: "$15.000 COP",
  precioNota: "por frasco, la que sea de las tres.",
  cta: "Avísame cuando salga",
  whatsapp: whatsappLinks.aguijon,
  castas: [
    { nombre: "Zángano", image: "/images/products/aguijon-zangano.webp" },
    { nombre: "Obrera", image: "/images/products/aguijon-obrera.webp" },
    { nombre: "Reina", image: "/images/products/aguijon-reina.webp" },
  ],
};

export const cierrePortafolio = {
  text: "Si no sabe por dónde empezar, escríbanos y le decimos cuál lote está en su punto.",
  cta: "Escríbenos por WhatsApp",
  whatsapp: whatsappLinks.portafolioCierre,
};

export const calidad = {
  eyebrow: "Calidad validada",
  title: "LA TAZA LA CALIFICARON OTROS, NO NOSOTROS",
  intro: "Origen 70 fue evaluada bajo protocolo SCA por dos catadores independientes, en dos lugares distintos.",
  puntajes: [
    {
      valor: 87.5,
      texto: "87.5",
      lugar: "Cafeína Coffee Shop",
      quien: "Julián Castañeda, instructor AST.",
    },
    {
      valor: 83.0,
      texto: "83.0",
      lugar: "Lusitania Coffee Co.",
      quien: "Alejandro Macías, catador campeón nacional 2023.",
    },
  ],
};

export const club = {
  eyebrow: "Programa de fidelización",
  title: "CLUB 1800",
  numero: "1800 · 18:00",
  text: "La altitud de la finca y una hora del día leídas en el mismo número. Tarjeta de membresía, bienvenida al club y drops exclusivos para gente que entiende del origen y la tradición.",
  nota: "Aún no está abierto. Se avisa por Instagram.",
  cta: "Seguir en Instagram",
  image: "/images/club/tarjeta-1800.webp",
  imageAlt: "Tarjeta de membresía del Club 1800: acabado metalizado con la hora 18:00 y la marca de montaña",
};

export const ctaFinal = {
  kicker: "Todo nace de la misma montaña.",
  title: "HABLE DIRECTO CON LA FINCA",
  text: "Le contamos qué hay tostado esta semana, en qué formato viene y cómo llega a su ciudad. Pedidos sujetos a disponibilidad de cosecha.",
  ctaPrimary: "Escríbenos por WhatsApp",
  ctaSecondary: "Instagram DM",
  whatsapp: whatsappLinks.ctaFinal,
};

export const footer = {
  location: "Pijao, Quindío · Colombia",
  handle: `@${INSTAGRAM_HANDLE}`,
};

export const siteMeta = {
  title: "BRUMA1800 — Café y miel de la misma montaña · Pijao, Quindío",
  description:
    "Café de finca familiar a 1.800 m.s.n.m. en Pijao, Quindío. Variedad Castillo, tostado en lote pequeño. Origen 70: 87.5 puntos SCA.",
};
