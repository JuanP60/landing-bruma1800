"""Recorta a la caja de alfa y optimiza la tarjeta del Club 1800.

    python tools/optimizar-tarjeta.py <origen.png> public/images/club/tarjeta-1800.webp

Mismo criterio que los mockups de producto: se recorta al contenido real para
que el ancho en CSS sea el ancho visible de la tarjeta. El PNG que entrega el
cliente trae ~68% de lienzo transparente alrededor; sin recortar, colocarla y
darle una sombra seria adivinar donde esta de verdad el objeto.

Sustituye al antiguo recorte por inundacion + poligono: aquel hacia falta
cuando el render venia sobre fondo blanco con el reflejo del suelo pegado al
canto. El archivo actual ya llega con alfa limpia y no necesita nada de eso.
"""
import os
import sys
from PIL import Image

ANCHO_SALIDA = 1200


def optimizar(src, dst):
    im = Image.open(src).convert("RGBA")
    original = im.size

    caja = im.getchannel("A").point(lambda p: 255 if p > 8 else 0).getbbox()
    im = im.crop(caja)
    recorte = im.size

    alto = round(ANCHO_SALIDA * recorte[1] / recorte[0])
    im = im.resize((ANCHO_SALIDA, alto), Image.LANCZOS)

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "WEBP", quality=90, method=6, alpha_quality=100)

    # La mascara del brillo usa este mismo archivo: si el contenido no llenara
    # la caja, el barrido de luz no cuadraria con la tarjeta.
    b = Image.open(dst).convert("RGBA").getchannel("A").point(lambda q: 255 if q > 8 else 0).getbbox()
    llena = b == (0, 0, ANCHO_SALIDA, alto)
    return original, recorte, (ANCHO_SALIDA, alto), os.path.getsize(dst) / 1024, llena


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    orig, rec, sal, kb, llena = optimizar(sys.argv[1], sys.argv[2])
    print(f"{orig[0]}x{orig[1]}  ->  recorte {rec[0]}x{rec[1]}  ->  {sal[0]}x{sal[1]}  {kb:.0f} KB")
    print(f"contenido llena la caja: {'si' if llena else 'NO'}")
