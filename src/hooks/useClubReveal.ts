"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ensureGsapPlugins, prefersReducedMotion, REVEAL_START, settle } from "@/lib/motion";

/**
 * Club 1800 usa un lenguaje de movimiento propio, deliberadamente distinto
 * al resto del sitio: fade largo, sin desplazamiento y sin cascada rápida.
 * No comparte easing ni duración con `useReveal`.
 */
export function useClubReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      if (!containerRef.current) return;
      const reduced = prefersReducedMotion();
      const els = Array.from(containerRef.current.querySelectorAll<HTMLElement>("[data-reveal-club]"));

      els.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          duration: reduced ? 0.5 : 1.5,
          ease: "power1.inOut",
          delay: i * (reduced ? 0.08 : 0.28),
          scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
          onComplete: () => settle(el),
        });
      });
    },
    { scope: containerRef },
  );

  return containerRef;
}
