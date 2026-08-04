"""Recorta la tarjeta del Club 1800 de su render y la deja lista para la web.

    python tools/recortar-tarjeta.py <render.png> public/images/club/tarjeta-1800.webp

El render original viene sobre fondo blanco y con el reflejo del suelo pegado
al canto inferior. Separar las dos cosas necesita dos mascaras multiplicadas,
porque ninguna sirve sola:

1. **Inundacion desde las esquinas.** Da el filo exacto, incluidas las esquinas
   redondeadas. Se rellena desde fuera, no se borra el blanco por color: la
   tarjeta es plateada casi blanca por dentro y un borrado por color se la
   llevaria entera.
2. **Poligono del contorno.** La inundacion sola no basta porque el reflejo
   comparte borde con el canto inferior y ningun umbral de color los separa.

Las coordenadas del poligono estan MEDIDAS sobre el render de 1536x1024, no
estimadas: el filo derecho baja de (1418,270) a (1309,740) y el inferior sube
de (200,722) a (800,811); su cruce da el vertice inferior derecho en (1273,879).
Si el render cambia, hay que volver a medirlas antes de tocar nada.
"""
import os
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ANCHO_SALIDA = 1200

CONTORNO = [
    (310, 105),                          # superior izquierdo
    (1424, 258),                         # superior derecho
    (1315, 742), (1277, 879),            # filo derecho
    (800, 815), (500, 769), (200, 725),  # filo inferior
    (140, 700),                          # inferior izquierdo
]
SEMILLAS = lambda W, H: [
    (0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1),
    (W // 2, 0), (0, H // 2), (W - 1, H // 2), (W // 2, H - 1),
]


def recortar(src, dst):
    base = Image.open(src).convert("RGB")
    W, H = base.size

    inundado = base.copy()
    for xy in SEMILLAS(W, H):
        ImageDraw.floodfill(inundado, xy, (255, 0, 255), thresh=10)

    px = inundado.load()
    alfa = Image.new("L", (W, H), 0)
    ap = alfa.load()
    for y in range(H):
        for x in range(W):
            if px[x, y] != (255, 0, 255):
                ap[x, y] = 255

    poli = Image.new("L", (W, H), 0)
    ImageDraw.Draw(poli).polygon(CONTORNO, fill=255)

    alfa = ImageChops.multiply(alfa, poli)
    # Medio pixel de desenfoque: sin esto el filo queda dentado sobre el negro
    # del Club, que es el fondo de mayor contraste de toda la pagina.
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.7))

    out = base.copy()
    out.putalpha(alfa)
    out = out.crop(out.getbbox())
    out = out.resize((ANCHO_SALIDA, round(ANCHO_SALIDA * out.size[1] / out.size[0])), Image.LANCZOS)

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    out.save(dst, "WEBP", quality=90, method=6, alpha_quality=100)
    return out.size, os.path.getsize(dst) / 1024


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    tam, kb = recortar(sys.argv[1], sys.argv[2])
    print(f"{tam[0]}x{tam[1]}  ->  {kb:.0f} KB")
