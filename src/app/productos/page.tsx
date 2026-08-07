import type { Metadata } from "next";
import PaginaInterior from "@/components/layout/PaginaInterior";
import Portafolio from "@/components/sections/Portafolio";
import { paginas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Productos — BRUMA1800",
  description:
    "Esencial, Origen 70, Drip Coffee y la miel picante Aguijón. Café y miel de finca familiar en Pijao, Quindío, a 1.800 m.s.n.m.",
};

/**
 * Reutiliza la sección de portafolio de la portada en vez de duplicar el copy.
 * Las tres tarjetas con sus precios, Aguijón con sus castas y el cierre ya
 * estaban ahí y son la misma verdad: repetirlos en otro archivo habría creado
 * dos sitios donde cambiar un precio.
 */
export default function ProductosPage() {
  return (
    <PaginaInterior pendiente={paginas.productos.pendiente}>
      <Portafolio comoPagina />
    </PaginaInterior>
  );
}
