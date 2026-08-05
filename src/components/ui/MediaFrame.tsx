import Image from "next/image";

type MediaFrameProps = {
  src: string;
  alt: string;
  aspectClassName: string;
  sizes?: string;
  className?: string;
  radiusClassName?: string;
};

/**
 * Marco del render de producto: el mockup transparente centrado sobre un panel
 * de piedra cálida, con la misma sombra propia que las piezas del hero. Van
 * recortados a su alfa, así que se pintan con `contain` para dejarlos respirar
 * dentro del marco.
 *
 * Tuvo un segundo modo, `fit="cover"`, para fotografía: componía un panel con
 * la marca de montaña al 10% mientras la foto no existiera, y lo destapaba solo
 * con que el archivo apareciera. Ya no queda ningún hueco de foto en la página
 * —el del Club lo cerró la tarjeta y el de la finca, el bucle de vídeo de
 * `MediaVideo`—, así que ese modo se retiró junto con su estado de error, igual
 * que antes se retiró la variante `vacio="club"`. El panel sigue existiendo
 * dentro de `MediaVideo`, que es donde hace falta de verdad.
 */
export default function MediaFrame({
  src,
  alt,
  aspectClassName,
  sizes = "100vw",
  className = "",
  radiusClassName = "rounded-2xl",
}: MediaFrameProps) {
  return (
    <figure className={`relative overflow-hidden bg-piedra-calida ${radiusClassName} ${aspectClassName} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain p-[12%] drop-shadow-[0_18px_22px_rgba(18,9,4,0.28)]"
      />
    </figure>
  );
}
