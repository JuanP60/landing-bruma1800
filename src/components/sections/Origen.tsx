"use client";

import { useReveal } from "@/hooks/useReveal";
import Wrap from "@/components/ui/Wrap";
import MediaFrame from "@/components/ui/MediaFrame";
import { Eyebrow, H2Rust, Body } from "@/components/ui/Typography";
import DecorOrigen from "@/components/decor/DecorOrigen";
import { origen } from "@/lib/content";

export default function Origen() {
  const mediaRef = useReveal<HTMLElement>("single");
  const textRef = useReveal<HTMLDivElement>("group");

  return (
    <section className="origen relative overflow-hidden bg-niebla pt-[160px] pb-20 md:py-28">
      <DecorOrigen />

      <Wrap className="relative z-10 grid items-center gap-12 md:grid-cols-2 md:gap-[72px]">
        <MediaFrame
          ref={mediaRef}
          data-reveal
          src="/images/pending/finca-familia.jpg"
          alt="Familia cafetera trabajando en la finca en Pijao"
          aspectClassName="order-2 aspect-[4/5] md:order-none md:aspect-auto md:h-[620px]"
          sizes="(min-width: 980px) 50vw, 100vw"
        />

        <div ref={textRef} data-reveal-group>
          <Eyebrow variant="onNiebla">{origen.eyebrow}</Eyebrow>
          <H2Rust>{origen.title}</H2Rust>
          {origen.paragraphs.map((html, i) => (
            <Body key={i} variant="onNiebla" dangerouslySetInnerHTML={{ __html: html }} />
          ))}
          <ul className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {origen.datos.map((d) => (
              <li key={d.label} className="rounded-xl border border-cafe-profundo/14 bg-hueso-claro p-[22px]">
                <span className="font-titulo mb-1.5 block text-[26px] text-cafe-profundo">{d.num}</span>
                <span className="text-sm leading-[1.6] text-tierra">{d.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Wrap>
    </section>
  );
}
