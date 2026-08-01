import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { brandFontVariables } from "@/fonts";
import { siteMeta } from "@/lib/content";
import SafetyNet from "@/components/SafetyNet";
import "./globals.css";

export const metadata: Metadata = {
  // Placeholder hasta que exista el dominio de producción: solo afecta a
  // cómo se resuelven las URLs relativas de Open Graph, no al contenido.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://bruma1800.com"),
  title: siteMeta.title,
  description: siteMeta.description,
  openGraph: {
    title: siteMeta.title,
    description: siteMeta.description,
    images: ["/images/logo/logo-bruma1800-oscuro.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={brandFontVariables}>
        {/* Marca que hay JS antes del primer pintado: sin esto, los estados
            iniciales de la capa de animación (opacity:0 en los data-reveal)
            provocarían un parpadeo. Si el JS está desactivado la clase nunca
            se pone y la página se ve completa, sin animar. */}
        <Script id="js-anim" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js-anim')`}
        </Script>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-cafe-profundo focus:px-4 focus:py-2 focus:text-hueso"
        >
          Saltar al contenido
        </a>
        {children}
        <SafetyNet />
      </body>
    </html>
  );
}
