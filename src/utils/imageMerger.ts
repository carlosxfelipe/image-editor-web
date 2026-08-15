export const mergeImagesHorizontally = async (files: File[]): Promise<File> => {
  if (files.length === 0) throw new Error("No files provided");
  if (files.length === 1) return files[0];

  // Load all images
  const loadedImages: HTMLImageElement[] = await Promise.all(
    files.map((file) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }),
  );

  // Find max height
  const maxHeight = Math.max(...loadedImages.map((img) => img.height));

  // Calculate new widths based on maxHeight to keep aspect ratio
  const imageSpecs = loadedImages.map((img) => {
    const scale = maxHeight / img.height;
    return {
      img,
      scaledWidth: img.width * scale,
      scaledHeight: maxHeight,
    };
  });

  // Calculate total width
  const totalWidth = imageSpecs.reduce(
    (sum, spec) => sum + spec.scaledWidth,
    0,
  );

  // Create canvas and draw
  const canvas = document.createElement("canvas");
  canvas.width = totalWidth;
  canvas.height = maxHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get 2d context");

  let currentX = 0;
  imageSpecs.forEach(({ img, scaledWidth, scaledHeight }) => {
    ctx.drawImage(img, currentX, 0, scaledWidth, scaledHeight);
    currentX += scaledWidth;
  });

  // Cleanup object URLs
  loadedImages.forEach((img) => URL.revokeObjectURL(img.src));

  // Convert to Blob and then to File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const mergedFile = new File([blob], "merged-image.png", {
            type: "image/png",
          });
          resolve(mergedFile);
        } else {
          reject(new Error("Canvas to Blob failed"));
        }
      },
      "image/png",
      1.0,
    );
  });
};
