"use client";

import Wrap from "@/components/ui/Wrap";
import { Eyebrow, H2Rust, Body } from "@/components/ui/Typography";
import { useReveal } from "@/hooks/useReveal";
import { useCounts } from "@/hooks/useCounts";
import { calidad } from "@/lib/content";

export default function Calidad() {
  const introRef = useReveal<HTMLDivElement>("group");
  const groupRef = useReveal<HTMLDivElement>("group");
  const countsRef = useCounts();

  /* Verde montaña (#4A6741) por decisión del cliente. Es el color del
     brandbook, pero el fondo pasa de casi negro a un tono medio y no todo el
     texto claro sobrevive al cambio: el eyebrow en --niebla caía a 3,72:1 y la
     línea del protocolo SCA, en --arena, a 3,25:1. Los dos van ahora en
     --piedra-calida. Números y método en handoff.md §2.10. */
  return (
    <section className="calidad bg-verde-hoja py-20 md:py-28">
      <Wrap>
        <div ref={introRef} data-reveal-group>
          <Eyebrow variant="onVerde">{calidad.eyebrow}</Eyebrow>
          <H2Rust light>{calidad.title}</H2Rust>
          <Body variant="light" intro>
            {calidad.intro}
          </Body>
        </div>

        <div
          ref={(node) => {
            groupRef.current = node;
            countsRef.current = node;
          }}
          data-reveal-group
          className="grid gap-7 sm:grid-cols-2"
        >
          {calidad.puntajes.map((p) => (
            <article key={p.lugar} className="rounded-2xl border border-piedra-calida/22 p-10">
              <p data-count className="font-titulo text-[clamp(64px,11vw,96px)] leading-none text-hueso tabular-nums">
                {p.texto}
              </p>
              {/* --arena era el tono más apagado de la tarjeta sobre café
                  profundo; sobre el verde se queda en 3,25:1 y no llega al
                  mínimo. Sube a --piedra-calida, que da 4,76:1. */}
              <p className="mt-3 mb-6 text-sm tracking-[0.1em] text-piedra-calida uppercase">puntos · protocolo SCA</p>
              <hr className="mb-6 h-px border-0 bg-piedra-calida/20" />
              <p className="font-editorial mb-2 text-[22px] text-hueso italic">{p.lugar}</p>
              <p className="text-base leading-[1.7] text-piedra-calida">{p.quien}</p>
            </article>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
