export const MAX_PRODUCT_IMAGES = 20;
export const MAX_IMAGE_BYTES = 500 * 1024;
export const MAX_IMAGE_DIMENSION = 1920;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      type,
      quality
    );
  });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return readFileAsDataUrl(new File([blob], "image.jpg", { type: blob.type }));
}

export async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("NOT_IMAGE");
  }
  if (file.size <= MAX_IMAGE_BYTES) {
    const dataUrl = await readFileAsDataUrl(file);
    const img = await loadImage(dataUrl);
    if (img.width <= MAX_IMAGE_DIMENSION && img.height <= MAX_IMAGE_DIMENSION) {
      return dataUrl;
    }
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);
  let { width, height } = img;
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_ERROR");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.92;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);
  while (blob.size > MAX_IMAGE_BYTES && quality > 0.3) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error("TOO_LARGE");
  }

  return blobToDataUrl(blob);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
