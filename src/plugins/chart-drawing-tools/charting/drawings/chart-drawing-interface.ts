import { MouseEventParams, Point, Time } from 'lightweight-charts';

export interface IChartDrawing {
    select(): void;
    deselect(): void;
    onMouseMove(event: MouseEventParams): void;
    onHoverWhenSelected(point: Point): void;
    onDrag(param: MouseEventParams, startPoint: Point, endPoint: Point): void;
    onClick(point?: Point, time? : Time): void;
    normalizeStyleOptions(styleOptions : {}):void;
} 