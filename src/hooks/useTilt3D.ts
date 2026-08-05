"use client";

import { useEffect, useRef } from "react";

/**
 * Inclinación 3D que sigue al cursor o al dedo. Pensada para la tarjeta del
 * Club, que es el único objeto de la página con el que se puede "jugar".
 *
 * **No toca `transform` desde JS, solo dos custom properties.** El hook escribe
 * `--tx` y `--ty` normalizadas de -1 a 1 respecto al centro del elemento, y es
 * el CSS el que decide cuántos grados son. Eso deja el rango en un solo sitio
 * (`--tilt` en globals.css), permite que `prefers-reduced-motion` lo recorte sin
 * que el hook se entere, y evita el choque clásico de este proyecto: la tarjeta
 * ya tiene una animación de flotación sobre `translate` y `scale`, y escribir
 * `transform` completo desde JS la pisaría. Al repartirlo así, la flotación y la
 * inclinación conviven sobre propiedades distintas.
 *
 * El movimiento se acumula en un `requestAnimationFrame`: `mousemove` dispara
 * mucho más a menudo de lo que la pantalla puede pintar, y sin esto se
 * recalcularía el estilo varias veces por fotograma para nada.
 */
export function useTilt3D<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pendiente = 0;
    const acotar = (v: number) => Math.max(-1, Math.min(1, v));

    function apuntar(clientX: number, clientY: number) {
      const caja = el!.getBoundingClientRect();
      const x = (clientX - (caja.left + caja.width / 2)) / (caja.width / 2);
      const y = (clientY - (caja.top + caja.height / 2)) / (caja.height / 2);

      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() => {
        el!.classList.add("esta-inclinandose");
        el!.style.setProperty("--tx", acotar(x).toFixed(3));
        // Invertida: así el borde por el que se empuja se aleja, que es como se
        // lee un objeto físico al que le apoyas el dedo.
        el!.style.setProperty("--ty", acotar(-y).toFixed(3));
      });
    }

    function soltar() {
      cancelAnimationFrame(pendiente);
      // Se quita la clase ANTES de poner las variables a cero: es lo que
      // devuelve la transición con rebote y hace que vuelva sola.
      el!.classList.remove("esta-inclinandose");
      el!.style.setProperty("--tx", "0");
      el!.style.setProperty("--ty", "0");
    }

    const alMover = (e: MouseEvent) => apuntar(e.clientX, e.clientY);

    const alArrastrar = (e: TouchEvent) => {
      // Sin esto, arrastrar sobre la tarjeta desplaza la página y la
      // inclinación no llega a sentirse.
      e.preventDefault();
      const dedo = e.touches[0];
      if (dedo) apuntar(dedo.clientX, dedo.clientY);
    };

    el.addEventListener("mousemove", alMover);
    el.addEventListener("mouseleave", soltar);
    // `passive: false` es obligatorio: sin él el navegador ignora el
    // preventDefault de touchmove y avisa por consola.
    el.addEventListener("touchmove", alArrastrar, { passive: false });
    el.addEventListener("touchend", soltar);
    el.addEventListener("touchcancel", soltar);

    return () => {
      cancelAnimationFrame(pendiente);
      el.removeEventListener("mousemove", alMover);
      el.removeEventListener("mouseleave", soltar);
      el.removeEventListener("touchmove", alArrastrar);
      el.removeEventListener("touchend", soltar);
      el.removeEventListener("touchcancel", soltar);
    };
  }, []);

  return ref;
}
