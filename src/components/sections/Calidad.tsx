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

  return (
    <section className="bg-cafe-profundo py-20 md:py-28">
      <Wrap>
        <div ref={introRef} data-reveal-group>
          <Eyebrow variant="light">{calidad.eyebrow}</Eyebrow>
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
              <p className="mt-3 mb-6 text-sm tracking-[0.1em] text-arena uppercase">puntos · protocolo SCA</p>
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
