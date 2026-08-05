import MediaFrame from "@/components/ui/MediaFrame";
import Button from "@/components/ui/Button";
import type { cards } from "@/lib/content";

type ProductCardProps = (typeof cards)[number];

export default function ProductCard({ kicker, title, desc, precios, whatsapp, image, imageAlt }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-cafe-profundo/14 bg-hueso-claro transition-[transform,box-shadow,border-color] duration-[400ms] ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[3px] hover:border-cafe-profundo/24 hover:shadow-[0_18px_40px_-24px_rgba(59,36,24,.45)]">
      {/* Render transparente del propio producto, no fotografía. Los tres
          mockups ya existían y solo se usaban en el hero; aquí ahorran la
          espera de las fotos reales sin recurrir a banco de imágenes, que la
          marca prohíbe. */}
      <MediaFrame
        src={image}
        alt={imageAlt}
        aspectClassName="aspect-[4/3]"
        radiusClassName="rounded-none"
        sizes="(min-width: 980px) 33vw, (min-width: 720px) 50vw, 100vw"
      />
      <div className="p-8">
        <p className="font-editorial mb-2.5 text-sm tracking-[0.1em] text-verde-hoja uppercase italic">{kicker}</p>
        <h3 className="font-titulo mb-3.5 text-[32px] text-cafe-profundo">{title}</h3>
        <p className="mb-[26px] text-base leading-[1.75] text-tierra">{desc}</p>
        <dl className="border-t border-cafe-profundo/14">
          {precios.map((p) => (
            <div key={p.label} className="flex justify-between gap-4 border-b border-cafe-profundo/9 py-3.5 last:border-b-0">
              <dt className="text-[15px] text-tierra">{p.label}</dt>
              <dd className="text-[15px] font-bold text-cafe-profundo">{p.value}</dd>
            </div>
          ))}
        </dl>
        <Button variant="ghost-dark" block href={whatsapp} external>
          Habla con la finca
        </Button>
      </div>
    </article>
  );
}
