import type { Metadata } from "next";
import PaginaInterior from "@/components/layout/PaginaInterior";
import Origen from "@/components/sections/Origen";
import Calidad from "@/components/sections/Calidad";
import { paginas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Quiénes somos — BRUMA1800",
  description:
    "Las fincas La Cubana y El Retiro, en Pijao, Quindío, a 1.800 m.s.n.m. Variedad Castillo, familias Osorio y Restrepo, y dos catas SCA independientes.",
};

/**
 * Junta las dos secciones que hablan de quién está detrás: el origen (las dos
 * fincas y las dos familias) y la validación en taza. En la portada están
 * separadas por el portafolio; aquí van seguidas, que es como se leen mejor
 * cuando alguien viene a preguntar precisamente eso.
 */
export default function QuienesSomosPage() {
  return (
    <PaginaInterior pendiente={paginas.quienesSomos.pendiente}>
      <Origen comoPagina />
      <Calidad />
    </PaginaInterior>
  );
}
