import localFont from "next/font/local";

/**
 * Las 5 tipografías de marca, ya en WOFF2 (convertidas desde
 * design_handoff_landing/fonts/ con tools/convertir-fuentes.py del proyecto
 * original). Suranna es la variante ya reparada con tildes, ñ y rayas
 * propias — ver tools/reparar_suranna.py en el repo original para el porqué.
 *
 * next/font/local las autohospeda y precarga: sin FOIT/FOUT y sin llamada a
 * un CDN externo, mejor que el @font-face manual del sitio estático.
 */

export const britannySignature = localFont({
  src: "./BrittanySignature.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--nf-firma",
});

export const introRustLine = localFont({
  src: "./IntroRust-Line.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--nf-titulo",
});

export const suranna = localFont({
  src: "./Suranna-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--nf-editorial",
});

export const aileron = localFont({
  src: "./Aileron-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--nf-texto",
});

export const darrellRolando = localFont({
  src: "./Darrell-Rolando.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--nf-firma-alt",
});

export const brandFontVariables = [
  britannySignature.variable,
  introRustLine.variable,
  suranna.variable,
  aileron.variable,
  darrellRolando.variable,
].join(" ");
