import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType, Time } from 'lightweight-charts';
import { MousePointAndTime } from '../../common/points';
import { ViewBase } from './drawing-view-base';

export interface IChartDrawing {
    select(): void;
    deselect(): void;
    onMouseMove(event: MousePointAndTime): void;
    onHoverWhenSelected(point: Point): void;
    onDrag(param: MousePointAndTime, startPoint: Point, endPoint: Point): void;
    onClick(point: MousePointAndTime): void;
    normalizeStyleOptions(styleOptions : {}):void;
    createNewView(chart: IChartApi, series: ISeriesApi<SeriesType>): ViewBase;
} 