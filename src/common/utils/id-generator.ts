/**
 * Generates a unique ID using timestamp and random string
 * @param prefix Optional prefix for the ID
 * @returns A unique string ID
 */
export function generateUniqueId(prefix: string = ''): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `${prefix}${timestamp}_${randomStr}`;
} 