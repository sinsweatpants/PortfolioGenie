export interface OptimizeImageOptions {
  maxWidth?: number;
  quality?: number;
}

export interface OptimizedImageResult {
  optimizedFile: File;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  optimizedDataUrl: string;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (event) => {
      URL.revokeObjectURL(url);
      reject(event);
    };
    image.src = url;
  });
}

function getCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to acquire 2D context");
  }
  return { canvas, context };
}

export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<OptimizedImageResult> {
  const image = await loadImage(file);
  const maxWidth = options.maxWidth ?? 1600;
  const quality = options.quality ?? 0.82;

  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const targetWidth = Math.round(image.width * scale);
  const targetHeight = Math.round(image.height * scale);

  const { canvas, context } = getCanvas(targetWidth, targetHeight);
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to optimize image"));
        }
      },
      "image/webp",
      quality,
    );
  });

  const optimizedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: blob.type });

  const optimizedDataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(blob);
  });

  return {
    optimizedFile,
    width: targetWidth,
    height: targetHeight,
    originalSize: file.size,
    optimizedSize: optimizedFile.size,
    optimizedDataUrl,
  };
}
