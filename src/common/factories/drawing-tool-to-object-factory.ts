import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { DrawingToolType } from "../../chart/toolbar/tools/drawing-tools";
import { RectangleDrawing } from "../../chart/drawings/rectangle/rectangle-drawing";
import { RectangleExtendedDrawing } from "../../chart/drawings/rectangle-extended/rectangle-extended-drawing";
import { LineDrawing } from "../../chart/drawings/line/line-drawing";
import { LineHorizontalDrawing } from "../../chart/drawings/line-horizontal/line-horizontal-drawing";
import { LineVerticalDrawing } from "../../chart/drawings/line-vertical/line-vertical-drawing";
import { LineHorizontalRayDrawing } from "../../chart/drawings/line-horizontal-ray/line-horizontal-ray-drawing";
import { FibonacciDrawing } from "../../chart/drawings/fibonacci/fibonacci-drawing";
import { ChartDrawingBase, ChartDrawingBaseProps } from "../../chart/drawings/chart-drawing-base";
import { RectangleLineExtendedDrawing } from "../../chart/drawings/rectangle-line-extended/rectangle-line-extended-drawing";
import { RectangleLineDrawing } from "../../chart/drawings/rectangle-line/rectangle-line-drawing";

export const DrawingObjectFactory: Partial<Record<DrawingToolType, (chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string, item: ChartDrawingBaseProps) => ChartDrawingBase>> = {
    [DrawingToolType.Rectangle]: (chart, series, symbolName, item) => new RectangleDrawing(chart, series, symbolName, item),
    [DrawingToolType.RectangleExtended]: (chart, series, symbolName, item) => new RectangleExtendedDrawing(chart, series, symbolName, item),
    [DrawingToolType.RectangleLine]: (chart, series, symbolName, item) => new RectangleLineDrawing(chart, series, symbolName, item),
    [DrawingToolType.RectangleLineExtended]: (chart, series, symbolName, item) => new RectangleLineExtendedDrawing(chart, series, symbolName, item),
    [DrawingToolType.Line]: (chart, series, symbolName, item) => new LineDrawing(chart, series, symbolName, item),
    [DrawingToolType.HorizontalLine]: (chart, series, symbolName, item) => new LineHorizontalDrawing(chart, series, symbolName, item),
    [DrawingToolType.VerticalLine]: (chart, series, symbolName, item) => new LineVerticalDrawing(chart, series, symbolName, item),
    [DrawingToolType.HorizontalLineRay]: (chart, series, symbolName, item) => new LineHorizontalRayDrawing(chart, series, symbolName, item),
    [DrawingToolType.Fibonacci]: (chart, series, symbolName, item) => new FibonacciDrawing(chart, series, symbolName, item),
};