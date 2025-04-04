import { IChartApi, ISeriesApi, SeriesType, MouseEventParams, Point } from 'lightweight-charts';
import { DrawingToolType, DrawingStyle } from '../toolbar/tools/drawing-tools';
import { DrawingPoint } from '../../common/common';

export interface IChartDrawing {
    id: string;
    userId: string;
    tags: string[];
    symbolName: string;
    type: DrawingToolType;
    drawingPoints: DrawingPoint[];
    styleOptions: {};
    isVisible: boolean;
    text: string;
    leftOffsetSeconds: number; //used to project from left date, in seconds.  negative projects left, positive projects right
    rightOffsetSeconds: number;//used to project from right date, in seconds.  negative projects left, positive projects right
    secondsPerBar: number; //timeframe of chart in seconds
    // Methods
   // draw(chart: IChartApi, series: ISeriesApi<SeriesType>): void;
    remove(): void;
    select(): void;
    deselect(): void;

    startDrawing(): void;
    stopDrawing(): void;

    onMouseMove(event: MouseEventParams): void;
    onClick(event: MouseEventParams): void;

    updateStyle(style: Partial<DrawingStyle>): void;
    //getBounds(): { top: number; bottom: number; left: number; right: number };
    containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean
} 