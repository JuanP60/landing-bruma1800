"use client";

import Image from "next/image";
import Wrap from "@/components/ui/Wrap";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import Montana from "@/components/decor/Montana";
import { BrumaBack, BrumaFront } from "@/components/decor/Bruma";
import { useHeroIntro, useHeroProducts, useCiclo } from "@/hooks/useHeroAnimations";
import { ciclo, hero, whatsappLinks } from "@/lib/content";

const PRODUCTS = [
  {
    key: "origen70",
    src: "/images/products/origen70.webp",
    alt: "Bolsa de café Origen 70 de BRUMA1800",
    width: 800,
    height: 1100,
    priority: true,
  },
  {
    key: "esencial",
    src: "/images/products/esencial.webp",
    alt: "Bolsa de café Esencial de BRUMA1800",
    width: 660,
    height: 884,
    priority: false,
  },
  {
    key: "drip",
    src: "/images/products/drip.webp",
    alt: "Sachets de Drip Coffee de BRUMA1800",
    width: 780,
    height: 831,
    priority: false,
  },
  {
    key: "aguijon",
    src: "/images/products/aguijon-reina.webp",
    alt: "Frasco de miel picante Aguijón Reina de BRUMA1800",
    width: 380,
    height: 452,
    priority: false,
  },
] as const;

export default function Hero() {
  const { logoRef, seqRef } = useHeroIntro();
  const stageRef = useHeroProducts();
  const cicloRef = useCiclo();

  return (
    <header className="hero relative bg-niebla pt-10 pb-[72px] md:pt-14 md:pb-24">
      <Montana />
      <BrumaBack />

      <Wrap className="relative z-10">
        <Image
          ref={logoRef}
          data-hero-logo
          src="/images/logo/logo-bruma1800-oscuro.png"
          alt="BRUMA1800 — Pijao, Quindío"
          width={518}
          height={232}
          priority
          className="h-16 w-auto md:h-[92px]"
        />

        <div className="mt-12 grid gap-12 md:mt-[72px] md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16">
          <div ref={seqRef} data-hero-seq>
            <Eyebrow variant="onNiebla">{hero.eyebrow}</Eyebrow>
            <p className="font-firma mt-5 text-[clamp(42px,8vw,60px)] leading-none text-tierra">{hero.script}</p>
            <h1 className="font-editorial mt-3 text-[clamp(40px,7.4vw,76px)] leading-[1.18] text-cafe-profundo italic">
              {hero.title}
            </h1>
            <p className="font-editorial mt-6 max-w-[56ch] text-[clamp(19px,2.4vw,23px)] leading-[1.7] text-cafe-profundo italic">
              {hero.lede}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button variant="primary" href={whatsappLinks.hero} external>
                {hero.ctaPrimary}
              </Button>
              <Button variant="ghost-light" href="#portafolio">
                {hero.ctaSecondary}
              </Button>
            </div>
          </div>

          {/* Composición flotante de producto. El orden del DOM es el orden del
              reveal (origen70 → esencial → drip → aguijón); el apilamiento
              visual lo decide z-index en globals.css, no este orden. */}
          <div ref={stageRef} data-hero-stage className="hero-stage">
            {PRODUCTS.map((p) => (
              <div key={p.key} className={`hero-prod hero-prod--${p.key}`} data-prod>
                <div className="hero-prod__inner">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    priority={p.priority}
                    loading={p.priority ? undefined : "eager"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <ol ref={cicloRef} data-ciclo className="ciclo mt-16 grid gap-7 pt-8 md:mt-20 md:grid-cols-3 md:gap-8">
          {ciclo.map((step) => (
            <li key={step.num}>
              <span className="font-titulo mb-2 block text-xl text-cafe-profundo">{step.num}</span>
              <h2 className="font-editorial mb-1.5 text-xl text-cafe-profundo italic">{step.title}</h2>
              <p className="text-[15px] leading-[1.7] text-cafe-profundo">{step.text}</p>
            </li>
          ))}
        </ol>
      </Wrap>

      <BrumaFront />
    </header>
  );
}
