"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ensureGsapPlugins, prefersReducedMotion, REVEAL_START, settle } from "@/lib/motion";

/** Entrada del hero al cargar: logo, luego el bloque de texto en cascada
 * (eyebrow → firma → titular → lede → botones). No depende de scroll. */
export function useHeroIntro() {
  const logoRef = useRef<HTMLImageElement>(null);
  const seqRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    ensureGsapPlugins();
    const reduced = prefersReducedMotion();
    const duration = reduced ? 0.4 : 0.85;

    if (logoRef.current) {
      gsap.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration,
        ease: "power3.out",
        onComplete: () => settle(logoRef.current!),
      });
    }
    if (seqRef.current) {
      const parts = Array.from(seqRef.current.children);
      gsap.to(parts, {
        opacity: 1,
        y: 0,
        duration: reduced ? 0.45 : 1,
        ease: "power3.out",
        stagger: reduced ? 0.05 : 0.14,
        delay: reduced ? 0.05 : 0.18,
        onComplete: () => settle(parts),
      });
    }
  }, []);

  return { logoRef, seqRef };
}

/** Reveal escalonado de los 4 mockups flotantes, en el orden del DOM:
 * origen70 → esencial → drip → aguijón. Rotación y flotación son CSS puro
 * en el hijo (`.hero-prod__inner`); GSAP solo anima opacity/y del padre. */
export function useHeroProducts() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      if (!stageRef.current) return;
      const prods = Array.from(stageRef.current.querySelectorAll<HTMLElement>("[data-prod]"));
      if (!prods.length) return;

      const reduced = prefersReducedMotion();
      gsap.to(prods, {
        opacity: 1,
        y: 0,
        duration: reduced ? 0.45 : 1.05,
        ease: "power3.out",
        stagger: reduced ? 0.06 : 0.19,
        scrollTrigger: { trigger: stageRef.current, start: REVEAL_START, once: true },
        onComplete: () => settle(prods),
      });
    },
    { scope: stageRef },
  );

  return stageRef;
}

/** Ciclo Floración → Polinización → Cosecha: los 3 pasos entran en
 * secuencia y una línea de progreso recorre el borde superior con scrub. */
export function useCiclo() {
  const cicloRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      if (!cicloRef.current) return;
      const reduced = prefersReducedMotion();
      const steps = Array.from(cicloRef.current.children);

      gsap.to(steps, {
        opacity: 1,
        y: 0,
        duration: reduced ? 0.4 : 0.9,
        ease: "power3.out",
        stagger: reduced ? 0.05 : 0.18,
        scrollTrigger: { trigger: cicloRef.current, start: REVEAL_START, once: true },
        onComplete: () => settle(steps),
      });

      // Scrub = intrusivo: con reduced-motion la línea se pinta completa
      // desde CSS (ver globals.css) y no se anima.
      if (reduced) return;
      gsap.to(cicloRef.current, {
        "--ciclo-p": 1,
        ease: "none",
        scrollTrigger: {
          trigger: cicloRef.current,
          start: "top 78%",
          end: "bottom 70%",
          scrub: 0.6,
        },
      });
    },
    { scope: cicloRef },
  );

  return cicloRef;
}
