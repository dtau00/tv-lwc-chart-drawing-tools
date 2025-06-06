import { BitmapPositionLength } from './common';

function centreOffset(lineBitmapWidth: number): number {
	return Math.floor(lineBitmapWidth * 0.5);
}

/**
 * Calculates the bitmap position for an item with a desired length (height or width), and centred according to
 * an position coordinate defined in media sizing.
 * @param positionMedia - position coordinate for the bar (in media coordinates)
 * @param pixelRatio - pixel ratio. Either horizontal for x positions, or vertical for y positions
 * @param desiredWidthMedia - desired width (in media coordinates)
 * @returns Position of of the start point and length dimension.
 */
export function positionsLine(
	positionMedia: number,
	pixelRatio: number,
	desiredWidthMedia: number = 1,
	widthIsBitmap?: boolean
): BitmapPositionLength {
	const scaledPosition = Math.round(pixelRatio * positionMedia);
	const lineBitmapWidth = widthIsBitmap
		? desiredWidthMedia
		: Math.round(desiredWidthMedia * pixelRatio);
	const offset = centreOffset(lineBitmapWidth);
	const position = scaledPosition - offset;
	return { position, length: lineBitmapWidth };
}

interface PositionBox {
	position: number;
	length: number;
}

export function positionsBox(p1: number, p2: number, pixelRatio: number): PositionBox {
	const min = Math.min(p1, p2);
	const max = Math.max(p1, p2);
	return {
		position: Math.round(min * pixelRatio),
		length: Math.round((max - min) * pixelRatio),
	};
}
