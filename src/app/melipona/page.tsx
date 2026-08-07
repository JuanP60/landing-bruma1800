import type { Metadata } from "next";
import PaginaInterior from "@/components/layout/PaginaInterior";
import Melipona from "@/components/sections/Melipona";
import { paginas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Línea Melipona — BRUMA1800",
  description:
    "Programa de distribución de BRUMA1800: pedido mínimo de $200.000 COP, precio fijo sin excepciones y disponibilidad sujeta a cosecha.",
};

export default function MeliponaPage() {
  return (
    <PaginaInterior pendiente={paginas.melipona.pendiente}>
      <Melipona comoPagina />
    </PaginaInterior>
  );
}
