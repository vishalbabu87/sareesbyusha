/**
 * Edge/runtime-safe base64 encoding helpers.
 *
 * Notes:
 * - Cloudflare Workers / Next.js Edge runtime don't provide Node.js Buffer.
 * - Using `String.fromCharCode(...bytes)` will throw for large arrays.
 *
 * This implementation chunks the conversion to avoid exceeding argument limits.
 */

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);

    // Convert bytes -> binary string in chunks to avoid call stack / arg limits.
    const chunkSize = 0x8000; // 32KB
    let binary = '';

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
}

export async function fileToDataUrl(file: File, fallbackMimeType: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(bytes);
    const mimeType = file.type || fallbackMimeType;
    return `data:${mimeType};base64,${base64}`;
}
