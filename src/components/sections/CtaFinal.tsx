"use client";

import Wrap from "@/components/ui/Wrap";
import Button from "@/components/ui/Button";
import { H2Rust } from "@/components/ui/Typography";
import { useReveal } from "@/hooks/useReveal";
import { ctaFinal, INSTAGRAM_URL } from "@/lib/content";

export default function CtaFinal() {
  const ref = useReveal<HTMLDivElement>("group");

  return (
    <section className="bg-cafe-profundo py-[88px] md:py-[120px]">
      <Wrap ref={ref} narrow data-reveal-group className="text-center">
        <p className="font-editorial mb-[18px] text-2xl text-arena italic">{ctaFinal.kicker}</p>
        <H2Rust light wide>
          {ctaFinal.title}
        </H2Rust>
        <p className="text-[17px] leading-[1.8] text-piedra-calida">{ctaFinal.text}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button variant="primary" href={ctaFinal.whatsapp} external>
            {ctaFinal.ctaPrimary}
          </Button>
          <Button variant="ghost-light" href={INSTAGRAM_URL} external>
            {ctaFinal.ctaSecondary}
          </Button>
        </div>
      </Wrap>
    </section>
  );
}
