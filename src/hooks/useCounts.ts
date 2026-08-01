"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ensureGsapPlugins, prefersReducedMotion, REVEAL_START } from "@/lib/motion";

/**
 * Conteo de los puntajes SCA. El HTML/JSX siempre trae el valor final: solo
 * se sobrescribe una vez arranca el tween, así que si ScrollTrigger nunca
 * dispara, el valor correcto sigue en pantalla. Cifras verificadas con el
 * cliente — nunca deben quedar en un número distinto al real.
 */
export function useCounts() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      if (!containerRef.current) return;
      const reduced = prefersReducedMotion();
      const els = Array.from(containerRef.current.querySelectorAll<HTMLElement>("[data-count]"));

      els.forEach((el) => {
        const finalText = el.textContent?.trim() ?? "";
        const value = parseFloat(finalText);
        if (Number.isNaN(value)) return;

        const decimals = (finalText.split(".")[1] || "").length;
        const counter = { n: 0 };
        const restore = () => {
          el.textContent = finalText;
        };

        gsap.to(counter, {
          n: value,
          duration: reduced ? 0.6 : 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
          onStart: () => {
            el.textContent = (0).toFixed(decimals);
          },
          onUpdate: () => {
            el.textContent = counter.n.toFixed(decimals);
          },
          onComplete: restore,
          onInterrupt: restore,
        });
      });
    },
    { scope: containerRef },
  );

  return containerRef;
}
