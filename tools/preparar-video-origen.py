"""Prepara el bucle de video de la seccion de origen desde el comercial de la finca.

    python tools/preparar-video-origen.py "../MULTIMEDIA BRUMA1800/BRUMA COMERCIALES/BRUMA 1800 COMERCIAL #1.mp4"

El fuente vive en la videoteca del cliente, no en el repo: son 405 MB y no
tienen nada que hacer dentro de git. Lo que si se versiona es la salida, que
pesa 1,5 MB.

Toma un plano continuo del comercial vertical (2160x3840, 60 fps, 405 MB) y
saca de ahi lo unico que la pagina necesita: un bucle corto, mudo y ligero.

Tres decisiones que llevan dentro su porque:

**Recorte a 4:5.** El marco de Origen es 4:5 en movil y 514x620 (0.83) en
escritorio, asi que 4:5 cubre los dos con recorte minimo. El fuente es 9:16;
recortar aqui y no en el navegador evita cargar pixeles que `object-cover`
iba a tirar de todos modos.

**Ida y vuelta en vez de corte seco.** El plano es un travelling: su ultimo
fotograma no empalma con el primero, asi que un bucle normal daria un tiron a
cada vuelta. Se concatena el plano con su reverso y el movimiento se vuelve una
deriva que va y viene, sin un solo corte. No se usa fundido cruzado porque
emborrona el segundo del empalme, y en un plano tan lento se nota.

Los dos fotogramas del pliegue se descartan: `reverse` devuelve el ultimo y el
primero repetidos, y dejarlos ahi congela la imagen una trama en cada extremo.
Es el clasico tropiezo del ping-pong y se ve como un hipo.

**Un solo formato, MP4.** Lo normal seria ofrecer tambien WebM/VP9, pero aqui
no se paga: medido sobre este plano, a calidad indistinguible al 100% el VP9
pesa 1341 KB contra 1413 KB del H.264 — 72 KB, un 5%. Este material es luz
calida y suave, con poco detalle de alta frecuencia, y ahi VP9 no saca la
ventaja que saca en otros. No compensa un segundo archivo que hay que
regenerar y mantener sincronizado. Si algun dia el plano cambia por uno con
mas textura, vale la pena volver a medirlo antes de darlo por sentado.

El poster sale del primer fotograma: es lo que se ve antes de que cargue el
video y lo unico que se ve con `prefers-reduced-motion`.
"""
import os
import shutil
import subprocess
import sys

# Plano elegido: el corredor de la casa de la finca. Ver handoff.md seccion 2.8
# para los otros tres candidatos y por que se descartaron.
INICIO, FIN = 12.4, 17.4
FPS = 30                    # el fuente va a 60; un travelling lento no los necesita
ANCHO, ALTO = 720, 900      # 4:5
CRF = 28                    # comparado al 100% contra 26 y 30: 26 no se distingue y 30 ablanda el follaje

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MP4 = os.path.join(RAIZ, "public", "video", "finca-corredor.mp4")
POSTER = os.path.join(RAIZ, "public", "video", "finca-corredor.webp")


def binario(nombre):
    """ffmpeg no queda en el PATH al instalarlo con winget: no crea los enlaces."""
    ruta = shutil.which(nombre)
    if ruta:
        return ruta
    paquetes = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages")
    for base, _, archivos in os.walk(paquetes):
        if f"{nombre}.exe" in archivos:
            return os.path.join(base, f"{nombre}.exe")
    sys.exit(f"No encuentro {nombre}. Instalar con: winget install Gyan.FFmpeg")


def filtro_ida_y_vuelta():
    n = round((FIN - INICIO) * FPS)
    return (
        f"[0:v]trim=start={INICIO}:end={FIN},setpts=PTS-STARTPTS,"
        f"crop=iw:iw*5/4,scale={ANCHO}:{ALTO}:flags=lanczos,fps={FPS},"
        f"format=yuv420p,split[ida][vuelta];"
        f"[vuelta]reverse,trim=start_frame=1:end_frame={n - 1},setpts=PTS-STARTPTS[rev];"
        f"[ida][rev]concat=n=2:v=1[salida]"
    ), n


def main(fuente):
    ff = binario("ffmpeg")
    os.makedirs(os.path.dirname(MP4), exist_ok=True)
    filtro, n = filtro_ida_y_vuelta()

    subprocess.run(
        [ff, "-v", "error", "-i", fuente, "-filter_complex", filtro, "-map", "[salida]", "-an",
         "-c:v", "libx264", "-crf", str(CRF), "-preset", "slow",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-y", MP4],
        check=True,
    )
    subprocess.run(
        [ff, "-v", "error", "-ss", str(INICIO), "-i", fuente, "-frames:v", "1",
         "-vf", f"crop=iw:iw*5/4,scale={ANCHO}:{ALTO}:flags=lanczos",
         "-quality", "82", "-y", POSTER],
        check=True,
    )

    total = n + (n - 2)
    print(f"plano {INICIO}-{FIN}s  ->  ida y vuelta de {total} tramas ({total / FPS:.2f}s) a {FPS} fps")
    for ruta in (MP4, POSTER):
        print(f"  {os.path.basename(ruta):24} {os.path.getsize(ruta) / 1024:7.0f} KB")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
