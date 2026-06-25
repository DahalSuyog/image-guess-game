/**
 * Pre-renders pixelated versions of an image at 10 levels.
 * Level 1 = most pixelated (≈4px blocks), Level 10 = original image.
 * Uses canvas with imageSmoothingEnabled = false for sharp pixel blocks.
 */
export function generatePixelationLevels(
  img: HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement[] {
  const levels: HTMLCanvasElement[] = [];

  for (let level = 1; level <= 10; level++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    if (level === 10) {
      // Full resolution — draw directly
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      // Calculate pixel block size: level 1 → biggest blocks, level 9 → smallest
      const factor = Math.max(1, Math.floor((11 - level) * (Math.min(width, height) / 100)));
      const smallW = Math.max(1, Math.ceil(width / factor));
      const smallH = Math.max(1, Math.ceil(height / factor));

      // Step 1: Draw image at reduced resolution
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = smallW;
      tempCanvas.height = smallH;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(img, 0, 0, smallW, smallH);

      // Step 2: Scale back up with no smoothing → crisp pixel blocks
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, width, height);
    }

    levels.push(canvas);
  }

  return levels;
}

/**
 * Loads an image from a URL and returns an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
