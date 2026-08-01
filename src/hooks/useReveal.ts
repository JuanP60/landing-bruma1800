"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ensureGsapPlugins, motionDurations, prefersReducedMotion, REVEAL_START, settle } from "@/lib/motion";

/**
 * Reveal genérico por scroll (fade + translateY, dispara una sola vez).
 * Equivale a `[data-reveal]` (mode="single") o `[data-reveal-group]`
 * (mode="group", anima los hijos directos en cascada) del sitio original.
 *
 * El elemento devuelto (`ref`) debe llevar el mismo atributo `data-reveal`
 * o `data-reveal-group` en el JSX: ese atributo es lo que activa el estado
 * inicial `opacity:0` en globals.css antes de que React hidrate.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(mode: "single" | "group" = "single") {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      if (!ref.current) return;

      const reduced = prefersReducedMotion();
      const { duration, stagger } = motionDurations(reduced);
      const targets = mode === "group" ? Array.from(ref.current.children) : [ref.current];
      if (!targets.length) return;

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start: REVEAL_START, once: true },
        onComplete: () => settle(targets),
      });
    },
    { scope: ref },
  );

  return ref;
}
