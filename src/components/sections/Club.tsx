"use client";

import Image from "next/image";
import Wrap from "@/components/ui/Wrap";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { useClubReveal } from "@/hooks/useClubReveal";
import { club, INSTAGRAM_URL } from "@/lib/content";

export default function Club() {
  const gridRef = useClubReveal();

  return (
    <section className="bg-club-negro py-20 md:py-28">
      <Wrap ref={gridRef} className="grid items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
        <div data-reveal-club>
          <Eyebrow variant="club">{club.eyebrow}</Eyebrow>
          <h2 className="font-titulo mb-3 text-[clamp(38px,7vw,56px)] leading-[1.05] text-club-plata">{club.title}</h2>
          <p className="mb-7 text-[22px] tracking-[0.24em] text-club-gris">{club.numero}</p>
          <p className="mb-5 text-[16.5px] leading-[1.85] text-club-plata-media">{club.text}</p>
          <p className="font-editorial mb-[34px] border-t border-club-plata/20 pt-[22px] text-[19px] leading-[1.7] text-white italic">
            {club.nota}
          </p>
          <Button variant="club" href={INSTAGRAM_URL} external>
            {club.cta}
          </Button>
        </div>
        {/* La tarjeta va recortada sobre el fondo, no dentro de un recuadro con
            borde: es un objeto, no una fotografía enmarcada. Sin animación de
            flotación a propósito — el Club tiene lenguaje propio, fade largo y
            sin desplazamiento, y no recibe el tratamiento del resto de la
            página. La sombra la separa del negro sin necesidad de moverla. */}
        <figure data-reveal-club className="relative">
          <Image
            src={club.image}
            alt={club.imageAlt}
            width={1200}
            height={704}
            sizes="(min-width: 980px) 45vw, 92vw"
            className="h-auto w-full drop-shadow-[0_28px_45px_rgba(0,0,0,0.85)]"
          />
        </figure>
      </Wrap>
    </section>
  );
}
