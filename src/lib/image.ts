// Optimización de imágenes en el cliente, antes de subirlas a Supabase Storage.
// Se hace una sola vez por foto en lugar de en cada request del catálogo.

const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

// Formatos que el canvas arruinaría: el GIF pierde la animación y el SVG,
// al ser vectorial, no gana nada al rasterizarse.
const PASSTHROUGH_TYPES = new Set(["image/gif", "image/svg+xml"]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function extensionFor(file: File): string {
  return EXT_BY_TYPE[file.type] ?? "jpg";
}

/**
 * Redimensiona el lado más largo a MAX_DIMENSION y reencoda a WebP.
 * Una foto de celular de ~4MB queda en el orden de los 150KB.
 */
export async function compressImage(file: File): Promise<File> {
  if (PASSTHROUGH_TYPES.has(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    // imageOrientation respeta el EXIF: sin esto las fotos verticales de
    // celular se suben acostadas.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      `No se pudo procesar "${file.name}". Si es una foto de iPhone en formato HEIC, ` +
        `exportala como JPG antes de subirla.`
    );
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY)
  );
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}
