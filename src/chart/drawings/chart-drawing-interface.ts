import { MouseEventParams, Point, Time } from 'lightweight-charts';
import { MousePointAndTime } from '../../common/points';

export interface IChartDrawing {
    select(): void;
    deselect(): void;
    onMouseMove(event: MousePointAndTime): void;
    onHoverWhenSelected(point: Point): void;
    onDrag(param: MousePointAndTime, startPoint: Point, endPoint: Point): void;
    onClick(point: MousePointAndTime): void;
    normalizeStyleOptions(styleOptions : {}):void;
} 