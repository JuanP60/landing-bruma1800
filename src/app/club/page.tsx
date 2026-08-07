import type { Metadata } from "next";
import PaginaInterior from "@/components/layout/PaginaInterior";
import Club from "@/components/sections/Club";
import { paginas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Club 1800 — BRUMA1800",
  description:
    "El programa de fidelización de BRUMA1800. Todavía no está abierto: se avisa por Instagram.",
};

export default function ClubPage() {
  return (
    <PaginaInterior pendiente={paginas.club.pendiente}>
      <Club comoPagina />
    </PaginaInterior>
  );
}
