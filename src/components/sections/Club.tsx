"use client";

import Wrap from "@/components/ui/Wrap";
import Button from "@/components/ui/Button";
import MediaFrame from "@/components/ui/MediaFrame";
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
        <MediaFrame
          data-reveal-club
          src={club.image}
          alt={club.imageAlt}
          aspectClassName="aspect-[4/5] md:aspect-auto md:h-[520px]"
          radiusClassName="rounded-2xl"
          className="border border-club-plata/15"
          sizes="(min-width: 980px) 45vw, 100vw"
        />
      </Wrap>
    </section>
  );
}
