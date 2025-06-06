export function mergeOpacityIntoRgba(rgba: string, opacity: string): string {
    const rgbaRegex = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/;

    const match = rgba.match(rgbaRegex);
    if (!match) {
        return "" //throw new Error("Invalid RGBA format");
    }

    const [, r, g, b] = match.map(Number);
    const newOpacity = parseFloat(opacity);

    if (isNaN(newOpacity) || newOpacity < 0 || newOpacity > 1) {
		return "" //throw new Error("Invalid opacity value. Must be a number between 0 and 1.");
    }

    return `rgba(${r}, ${g}, ${b}, ${newOpacity})`;
}