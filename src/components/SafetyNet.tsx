"use client";

import { useEffect } from "react";
import { settle } from "@/lib/motion";

/**
 * Ningún contenido puede quedarse escondido porque un ScrollTrigger no
 * disparara. Dos pasadas: una a los 6 s para lo que ya está en pantalla, y
 * otra ligada al scroll para lo que aparezca después. Solo fuerza elementos
 * claramente dentro del viewport (85% de la altura), así no le pisa el fade
 * a lo que acaba de entrar. Monta una vez, en el layout raíz.
 */
const SAFETY_SELECTOR = [
  "[data-reveal]",
  "[data-reveal-club]",
  "[data-prod]",
  "[data-hero-logo]",
  "[data-reveal-group] > *",
  "[data-hero-seq] > *",
  "[data-ciclo] > li",
].join(",");

export default function SafetyNet() {
  useEffect(() => {
    function rescueStranded() {
      document.querySelectorAll<HTMLElement>(SAFETY_SELECTOR).forEach((el) => {
        if (window.getComputedStyle(el).opacity !== "0") return;
        const top = el.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.85) return;
        settle(el);
      });
    }

    const timeout = window.setTimeout(rescueStranded, 6000);
    let queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      window.setTimeout(() => {
        queued = false;
        rescueStranded();
      }, 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
