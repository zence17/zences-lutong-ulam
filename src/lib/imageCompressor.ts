export const COMPRESSED_IMAGE_PREFIX = "data:image/jpeg;base64,";

const MAX_DATA_URL_LENGTH = 90 * 1024;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.08;

export function isCompressedRecipePhoto(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(COMPRESSED_IMAGE_PREFIX);
}

function normalizeMaximumWidth(maxWidth: number): number {
  return Number.isFinite(maxWidth) && maxWidth > 0 ? Math.floor(maxWidth) : 600;
}

function normalizeQuality(quality: number): number {
  return Number.isFinite(quality) && quality > 0 && quality <= 1 ? quality : 0.72;
}

export function compressRecipePhoto(
  file: File,
  maxWidth = 600,
  quality = 0.72,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Please choose an image file."));
  }

  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    const safeMaxWidth = normalizeMaximumWidth(maxWidth);
    let currentQuality = normalizeQuality(quality);

    image.onload = () => {
      try {
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          throw new Error("Could not read that image. Please try another photo.");
        }

        const scale = Math.min(1, safeMaxWidth / image.naturalWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not prepare this photo. Please try another image.");
        }

        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        let dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
        while (dataUrl.length > MAX_DATA_URL_LENGTH && currentQuality > MIN_QUALITY) {
          currentQuality = Math.max(MIN_QUALITY, currentQuality - QUALITY_STEP);
          dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
        }

        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image. Please try another photo."));
    };

    image.src = objectUrl;
  });
}
