/**
 * Free Image Storage & Optimization Service for EcoWatch
 *
 * Guarantees ₹0 deployment cost without requiring Firebase Cloud Storage (Blaze plan)
 * or any mandatory paid billing account.
 *
 * Strategy:
 * 1. Client-Side Compression: High-resolution mobile/desktop photos (up to 5-10MB)
 *    are automatically downsampled to max 1000px and compressed via Canvas to ~40KB - 75KB.
 * 2. ImgBB Free Tier Integration (Optional): If VITE_IMGBB_API_KEY is configured,
 *    uploads to ImgBB (free API, no credit card required, 32MB limit, permanent direct URLs).
 * 3. Direct Firestore Storage: If no external key is provided, the optimized 50KB data URI
 *    is saved directly in the Firestore report document (well under the 1,048,576 byte Spark limit).
 */

export interface ImageUploadResult {
  url: string;
  provider: 'direct-compressed' | 'imgbb';
  approxSizeKb: number;
}

/**
 * Resizes and compresses an image in the browser using HTML5 Canvas.
 */
export async function compressImage(
  file: File,
  maxDimension = 1000,
  quality = 0.78
): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into memory.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while scaling to maxDimension
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original data URI
          const rawUrl = event.target?.result as string;
          resolve({ dataUrl: rawUrl, sizeKb: Math.round(rawUrl.length / 1024) });
          return;
        }

        // Draw image cleanly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with controlled compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((compressedDataUrl.length * (3 / 4)) / 1024);

        resolve({ dataUrl: compressedDataUrl, sizeKb });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Handles image upload for report submission with zero required paid services.
 */
export async function processAndUploadReportImage(
  file: File
): Promise<ImageUploadResult> {
  // Step 1: Always compress image client-side to minimize payload and bandwidth
  const { dataUrl, sizeKb } = await compressImage(file, 1000, 0.78);

  const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;

  // Step 2: If free ImgBB API key is configured, upload to ImgBB CDN
  if (imgbbApiKey && typeof imgbbApiKey === 'string' && imgbbApiKey.trim().length > 5) {
    try {
      // Strip data prefix
      const base64Clean = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

      const formData = new FormData();
      formData.append('image', base64Clean);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbApiKey.trim())}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.url) {
          return {
            url: data.data.url,
            provider: 'imgbb',
            approxSizeKb: sizeKb,
          };
        }
      }
      console.warn('ImgBB upload returned non-200, falling back to direct compressed storage');
    } catch (err) {
      console.warn('ImgBB upload error, falling back to direct compressed storage:', err);
    }
  }

  // Step 3: Default zero-configuration fallback: direct high-efficiency compressed image
  return {
    url: dataUrl,
    provider: 'direct-compressed',
    approxSizeKb: sizeKb,
  };
}
