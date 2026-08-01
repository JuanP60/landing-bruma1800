"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Idempotente: puede llamarse desde cada hook sin registrar el plugin dos veces. */
export function ensureGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/** Offset en píxeles desde el borde inferior, no en porcentaje: con un
 * umbral en "%" el footer podía quedar corto y no alcanzarlo nunca en
 * viewports altos. Ver bruma1800-landing/handoff.md §6 gotcha 4. */
export const REVEAL_START = "top bottom-=48";

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function motionDurations(reduced: boolean) {
  return {
    duration: reduced ? 0.4 : 0.85,
    stagger: reduced ? 0.04 : 0.12,
  };
}

/** Marca el elemento como revelado y limpia los estilos inline que deja GSAP.
 * Sin esto queda un `transform` residual que promueve el elemento a su propia
 * capa de composición y cambia la rasterización (visible como logo "apagado"
 * en móvil). Ver bruma1800-landing/handoff.md §6 gotcha 5. */
export function settle(target: gsap.TweenTarget) {
  const els = gsap.utils.toArray<Element>(target);
  els.forEach((el) => el.classList?.add("is-shown"));
  gsap.set(target, { clearProps: "all" });
}
