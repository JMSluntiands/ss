const SKIP_TYPES = new Set(['image/svg+xml', 'image/gif']);

export async function resizeImageFile(file: File, maxWidth: number, quality = 0.82): Promise<File> {
    if (!file.type.startsWith('image/') || SKIP_TYPES.has(file.type)) {
        return file;
    }

    let bitmap: ImageBitmap | null = null;

    try {
        bitmap = await createImageBitmap(file);
        if (bitmap.width <= maxWidth) {
            return file;
        }

        const scale = maxWidth / bitmap.width;
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return file;
        }

        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', quality);
        });

        if (!blob) {
            return file;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

        return new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    } catch {
        return file;
    } finally {
        bitmap?.close();
    }
}
