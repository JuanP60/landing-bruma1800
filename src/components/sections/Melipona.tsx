"use client";

import Wrap from "@/components/ui/Wrap";
import Button from "@/components/ui/Button";
import { Eyebrow, H2Rust, Body } from "@/components/ui/Typography";
import { useReveal } from "@/hooks/useReveal";
import { melipona } from "@/lib/content";

/**
 * Programa de distribución Melipona. Sección nueva: nació porque el cliente
 * pidió una pestaña de menú que no tenía a dónde llevar.
 *
 * **El copy es un borrador pendiente de aprobación.** Todo lo que dice sale de
 * los hechos verificados de `AGENTS.md` y nada más — ver el comentario de
 * `melipona` en `lib/content.ts`. No se ha añadido a quién va dirigido el
 * programa, ni plazos, ni condiciones de pago: eso no está verificado.
 *
 * Se apoya en las piezas que ya existen (`Wrap`, tipografía, tarjetas de dato
 * iguales a las de Origen) en vez de inventar una maqueta propia: es una
 * sección de servicio, no una pieza de portada.
 */
export default function Melipona() {
  const textoRef = useReveal<HTMLDivElement>("group");
  const datosRef = useReveal<HTMLUListElement>("group");

  return (
    <section id="melipona" className="melipona bg-piedra-calida py-20 md:py-28">
      <Wrap>
        <div ref={textoRef} data-reveal-group className="max-w-[62ch]">
          <Eyebrow>{melipona.eyebrow}</Eyebrow>
          <H2Rust>{melipona.title}</H2Rust>
          <Body intro>{melipona.intro}</Body>
        </div>

        <ul ref={datosRef} data-reveal-group className="mt-2 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {melipona.datos.map((d) => (
            <li key={d.label} className="rounded-xl border border-cafe-profundo/14 bg-hueso-claro p-[22px]">
              <span className="font-titulo mb-1.5 block text-[26px] text-cafe-profundo">{d.num}</span>
              <span className="text-sm leading-[1.6] text-tierra">{d.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Button variant="ghost-dark" href={melipona.whatsapp} external>
            {melipona.cta}
          </Button>
        </div>
      </Wrap>
    </section>
  );
}
