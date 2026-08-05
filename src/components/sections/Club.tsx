"use client";

import Image from "next/image";
import Wrap from "@/components/ui/Wrap";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { useClubReveal } from "@/hooks/useClubReveal";
import { useTilt3D } from "@/hooks/useTilt3D";
import { BrumaClub } from "@/components/decor/Bruma";
import { club, INSTAGRAM_URL } from "@/lib/content";

export default function Club() {
  const gridRef = useClubReveal();
  const tarjetaRef = useTilt3D<HTMLDivElement>();

  return (
    <section className="club relative overflow-hidden bg-club-negro py-20 md:py-28">
      <BrumaClub />

      <Wrap ref={gridRef} className="relative z-10 grid items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
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
        {/* La tarjeta va suelta sobre el fondo, no dentro de un recuadro con
            borde: es un objeto, no una fotografía enmarcada. Flota y tiene
            brillo metalizado, como los mockups del hero — excepción pedida por
            el cliente al lenguaje quieto del Club; ver globals.css.
            El brillo es un hermano, no un hijo del <img>: un elemento dentro
            de la imagen no existe, y como hermano puede mezclarse en `screen`
            usando la propia tarjeta como máscara. */}
        {/* El envoltorio existe solo para la inclinación 3D. No se puede poner
            sobre la propia tarjeta: GSAP le deja un `transform` en línea al
            revelarla y el estilo en línea gana a la hoja de estilos. Ver
            `.tarjeta-club-3d` en globals.css. */}
        <div ref={tarjetaRef} className="tarjeta-club-3d">
          <figure data-reveal-club className="tarjeta-club">
            {/* `loading="eager"` a conciencia. Con la carga perezosa por defecto,
                esta imagen concreta no llegaba a pedirse nunca: entera dentro del
                viewport, con scroll de rueda real y diez segundos de espera,
                seguía en `complete:false` y sin una sola petición de red. Se
                descartaron por medición el contenedor animado, el `will-change`,
                el `filter` y el `srcset` — copias inyectadas con cada uno de esos
                rasgos sí cargaban. La causa exacta quedó sin aislar.
                Cuesta 85 KB por adelantado; el precio de equivocarse al otro lado
                es que la sección se quede sin su único objeto. */}
            <Image
              src={club.image}
              alt={club.imageAlt}
              width={1200}
              height={708}
              loading="eager"
              sizes="(min-width: 980px) 45vw, 92vw"
            />
            <span className="tarjeta-club__brillo" aria-hidden="true" />
          </figure>
        </div>
      </Wrap>
    </section>
  );
}
