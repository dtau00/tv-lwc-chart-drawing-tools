import { MouseEventParams, Point, Time } from 'lightweight-charts';

export interface IChartDrawing {
    //id: string;
    //userId: string;
    //tags: string[];
    //symbolName: string;
    //type: DrawingToolType;
    //drawingPoints: DrawingPoint[];
    //styleOptions: {};
    //isVisible: boolean;
    //text: string;
    //leftOffsetSeconds: number; //used to project from left date, in seconds.  negative projects left, positive projects right
    //rightOffsetSeconds: number;//used to project from right date, in seconds.  negative projects left, positive projects right
    //secondsPerBar: number; //timeframe of chart in seconds
    // Methods
   // draw(chart: IChartApi, series: ISeriesApi<SeriesType>): void;
    //remove(): void;
    //startDrawing(): void;
    //stopDrawing(): void;
    select(): void;
    deselect(): void;
    onMouseMove(event: MouseEventParams): void;
    onHoverWhenSelected(point: Point): void;
    onDrag(param: MouseEventParams, startPoint: Point, endPoint: Point): void;
    onClick(point?: Point, time? : Time): void;
    //updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void;

    //updateStyle(style: Partial<DrawingStyle>): void;
    //getBounds(): { top: number; bottom: number; left: number; right: number };
    //containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean
} 