"use client";

import { useReveal } from "@/hooks/useReveal";
import Wrap from "@/components/ui/Wrap";
import MediaVideo from "@/components/ui/MediaVideo";
import { Eyebrow, H2Rust, Body } from "@/components/ui/Typography";
import DecorOrigen from "@/components/decor/DecorOrigen";
import { origen } from "@/lib/content";

export default function Origen() {
  const mediaRef = useReveal<HTMLElement>("single");
  const textRef = useReveal<HTMLDivElement>("group");

  return (
    <section className="origen relative overflow-hidden bg-piedra-calida pt-[160px] pb-20 md:py-28">
      <DecorOrigen />

      <Wrap className="relative z-10 grid items-center gap-12 md:grid-cols-2 md:gap-[72px]">
        {/* El hueco de `finca-familia.jpg` lo ocupa ahora un plano real de la
            finca, sacado del comercial que aportó el cliente. Es un bucle mudo
            de ida y vuelta; el porqué del plano y del recorte, en
            tools/preparar-video-origen.py. */}
        <MediaVideo
          ref={mediaRef}
          data-reveal
          src="/video/finca-corredor.mp4"
          poster="/video/finca-corredor.webp"
          label="corredor de la casa de la finca en Pijao, al atardecer"
          aspectClassName="order-2 aspect-[4/5] md:order-none md:aspect-auto md:h-[620px]"
        />

        <div ref={textRef} data-reveal-group>
          {/* Sin `variant="onNiebla"`: esta sección volvió a piedra cálida, donde
              --tierra da 5.02:1 por sí solo. Esa variante existe para compensar el
              azul bruma y aquí ya no hace falta. */}
          <Eyebrow>{origen.eyebrow}</Eyebrow>
          <H2Rust>{origen.title}</H2Rust>
          {origen.paragraphs.map((html, i) => (
            <Body key={i} dangerouslySetInnerHTML={{ __html: html }} />
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
