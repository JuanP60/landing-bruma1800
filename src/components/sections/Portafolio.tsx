"use client";

import Image from "next/image";
import Wrap from "@/components/ui/Wrap";
import Button from "@/components/ui/Button";
import { Eyebrow, H2Rust, Body } from "@/components/ui/Typography";
import { useReveal } from "@/hooks/useReveal";
import ProductCard from "@/components/portfolio/ProductCard";
import { aguijon, cards, cierrePortafolio } from "@/lib/content";

export default function Portafolio() {
  const introRef = useReveal<HTMLDivElement>("group");
  const cardsRef = useReveal<HTMLDivElement>("group");
  const aguijonRef = useReveal<HTMLElement>("single");
  const castasRef = useReveal<HTMLUListElement>("group");
  const cierreRef = useReveal<HTMLDivElement>("group");

  return (
    <section id="portafolio" className="bg-hueso py-20 md:py-28">
      <Wrap>
        <div ref={introRef} data-reveal-group>
          <Eyebrow>Portafolio</Eyebrow>
          <H2Rust>LO QUE SALE DE LA COSECHA</H2Rust>
          <Body intro>Tres líneas de café, cada una con su propósito en la taza. Los pedidos están sujetos a disponibilidad de cosecha.</Body>
        </div>

        <div ref={cardsRef} data-reveal-group className="grid items-start gap-7 sm:grid-cols-2 md:grid-cols-3">
          {cards.map((card) => (
            <ProductCard key={card.id} {...card} />
          ))}
        </div>

        <aside
          ref={aguijonRef}
          data-reveal
          className="mt-7 flex flex-wrap items-center justify-between gap-7 rounded-2xl bg-piedra-calida p-9 sm:flex-nowrap sm:px-10"
        >
          <div className="flex-1 basis-[300px]">
            <Eyebrow>{aguijon.eyebrow}</Eyebrow>
            <h3 className="font-editorial mb-2.5 text-[34px] text-cafe-profundo italic">{aguijon.title}</h3>
            <p className="mb-[18px] max-w-[52ch] text-[17px] leading-[1.8] text-tierra">{aguijon.desc}</p>
            <p className="mb-6 border-t border-cafe-profundo/16 pt-[18px] text-base leading-[1.6] text-tierra">
              <span className="text-[22px] font-bold text-cafe-profundo">{aguijon.precio}</span> {aguijon.precioNota}
            </p>
            <Button variant="ghost-dark" href={aguijon.whatsapp} external>
              {aguijon.cta}
            </Button>
          </div>
          <ul ref={castasRef} data-reveal-group className="grid max-w-[420px] flex-1 basis-[260px] grid-cols-3 gap-3">
            {aguijon.castas.map((casta) => (
              <li key={casta.nombre} className="text-center">
                <Image
                  src={casta.image}
                  alt={`Frasco de miel picante Aguijón ${casta.nombre} de BRUMA1800`}
                  width={380}
                  height={452}
                  className="h-auto w-full drop-shadow-[0_10px_14px_rgba(18,9,4,0.28)]"
                />
                <p className="font-editorial mt-2.5 text-sm tracking-[0.1em] text-tierra uppercase italic">{casta.nombre}</p>
              </li>
            ))}
          </ul>
        </aside>

        <div
          ref={cierreRef}
          data-reveal-group
          className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-cafe-profundo/14 pt-10"
        >
          <p className="font-editorial max-w-[52ch] text-[22px] leading-[1.6] text-cafe-profundo italic">{cierrePortafolio.text}</p>
          {/* La abeja sale de aquí y no de los otros CTA: esta sección habla de
              Aguijón y de las abejas que polinizan el cafetal. Ver `.btn--abeja`. */}
          <Button variant="primary" href={cierrePortafolio.whatsapp} external abeja>
            {cierrePortafolio.cta}
          </Button>
        </div>
      </Wrap>
    </section>
  );
}
