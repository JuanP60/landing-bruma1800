"use client";

import Image from "next/image";
import Wrap from "@/components/ui/Wrap";
import { useReveal } from "@/hooks/useReveal";
import { footer, INSTAGRAM_URL } from "@/lib/content";

export default function Footer() {
  const ref = useReveal<HTMLDivElement>("group");

  return (
    <footer className="bg-piedra-calida py-12">
      <Wrap ref={ref} data-reveal-group className="flex flex-wrap items-center justify-between gap-6">
        <Image
          src="/images/logo/logo-bruma1800-oscuro.png"
          alt="BRUMA1800 — Pijao, Quindío"
          width={518}
          height={232}
          className="h-[52px] w-auto"
        />
        <p className="text-[15px] text-tierra">{footer.location}</p>
        <p className="text-[15px] text-tierra">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="text-terracota hover:text-terracota-viva">
            {footer.handle}
          </a>
        </p>
      </Wrap>
    </footer>
  );
}
