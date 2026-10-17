import type { Area } from 'react-easy-crop';

/** Lado de la foto final: sobra para un círculo de 60 px en pantallas retina. */
const OUTPUT_SIDE = 512;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, 0.85));

/**
 * Recorta la imagen como la dejó el editor: gira `rotation` grados (múltiplo
 * de 90) y toma `area`, que react-easy-crop mide sobre la imagen ya girada.
 * La reduce a `OUTPUT_SIDE` para que la subida quede muy por debajo del
 * límite de 2 MB de la API. WebP conserva la transparencia de los logos; si
 * el navegador no lo genera, PNG.
 */
export async function cropImage({
  src,
  area,
  rotation,
}: {
  src: string;
  area: Area;
  rotation: number;
}): Promise<Blob> {
  const image = await loadImage(src);
  const quarterTurn = Math.abs(rotation / 90) % 2 === 1;
  const rotatedWidth = quarterTurn ? image.naturalHeight : image.naturalWidth;
  const rotatedHeight = quarterTurn ? image.naturalWidth : image.naturalHeight;

  // Imagen completa ya girada…
  const rotated = document.createElement('canvas');
  rotated.width = rotatedWidth;
  rotated.height = rotatedHeight;
  const rotatedCtx = rotated.getContext('2d');
  if (!rotatedCtx) throw new Error('No se pudo procesar la imagen');
  rotatedCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  rotatedCtx.rotate((rotation * Math.PI) / 180);
  rotatedCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  // …y de ella, el área elegida, reducida.
  const side = Math.min(OUTPUT_SIDE, Math.round(area.width));
  const output = document.createElement('canvas');
  output.width = side;
  output.height = side;
  output
    .getContext('2d')
    ?.drawImage(rotated, area.x, area.y, area.width, area.height, 0, 0, side, side);

  const webp = await canvasToBlob(output, 'image/webp');
  if (webp?.type === 'image/webp') return webp;
  const png = await canvasToBlob(output, 'image/png');
  if (!png) throw new Error('No se pudo procesar la imagen');
  return png;
}
