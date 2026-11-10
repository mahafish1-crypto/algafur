/**
 * Universal Zero-Error Image Auto-Optimizer
 * Proactively downscales photos to max 1920px (maintaining aspect ratio)
 * and converts to lightweight, high-fidelity WebP format (~82% quality).
 * Prevents payload timeouts, server crashes, and upload rejections.
 */
export async function optimizeImageFile(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<File> {
  // If not in browser environment or file is an SVG / GIF, return as is
  if (typeof window === "undefined" || !file || !file.type.startsWith("image/")) {
    return file;
  }

  // Preserve animated gifs and vector svgs
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => resolve(file); // fail-safe fallback
      reader.onload = () => {
        try {
          const img = new Image();
          img.onerror = () => resolve(file); // fail-safe fallback
          img.onload = () => {
            try {
              let width = img.naturalWidth || img.width;
              let height = img.naturalHeight || img.height;

              // If dimensions are within maxDimension and file is already under 800KB webp, return as is
              if (
                width <= maxDimension &&
                height <= maxDimension &&
                file.size < 800 * 1024 &&
                file.type === "image/webp"
              ) {
                resolve(file);
                return;
              }

              // Scale proportionally if either dimension exceeds maxDimension
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = Math.round((height * maxDimension) / width);
                  width = maxDimension;
                } else {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }

              const canvas = document.createElement("canvas");
              canvas.width = Math.max(1, width);
              canvas.height = Math.max(1, height);
              const ctx = canvas.getContext("2d");

              if (!ctx) {
                resolve(file);
                return;
              }

              // Smooth image downsampling
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    resolve(file);
                    return;
                  }

                  const cleanBaseName =
                    file.name.replace(/\.[^/.]+$/, "") || "image";
                  const cleanName = `${cleanBaseName}.webp`;
                  const optimizedFile = new File([blob], cleanName, {
                    type: "image/webp",
                    lastModified: Date.now(),
                  });
                  resolve(optimizedFile);
                },
                "image/webp",
                quality
              );
            } catch {
              resolve(file);
            }
          };
          img.src = reader.result as string;
        } catch {
          resolve(file);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}
