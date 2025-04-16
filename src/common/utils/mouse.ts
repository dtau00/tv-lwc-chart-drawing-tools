import { Point } from "lightweight-charts";

// check if mouse is being held, allow for some movement before starting drag (if the mouse jitters due to high dpi)
export function hasMouseMoved(mousePosition: Point, mouseDownStartPoint: Point, offset: number = 1): boolean {
    if (!mousePosition || !mouseDownStartPoint) return false;

    // TODO there's a conversion issue since we use MouseEvent for mousedown and MouseEventParams for mousemove, on y
    const yDiff = 0//Math.abs(this._mousePosition.y - this._mouseDownStartPoint.y);
    const xDiff = Math.abs(mousePosition.x - mouseDownStartPoint.x);
    return (xDiff > offset || yDiff > offset)
}