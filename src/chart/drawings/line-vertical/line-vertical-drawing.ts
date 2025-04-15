import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType,Coordinate} from 'lightweight-charts';
import { LineVertical as View } from './line-vertical-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions, normalizeLineDrawingToolOptions } from '../common/options/line-options';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../../../chart/drawings/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { isPointNearLine, convertAndNormalizeDrawingPointsToPoint, MousePointAndTime } from '../../../common/points';
import { DrawingPoint } from '../../../common/points';
import { ViewBase } from '../drawing-view-base';

export class LineVerticalDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private static readonly TOOL_TYPE = DrawingToolType.VerticalLine

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		const _finalizeDrawingPoints =()=>{
			let p2 = this.drawingPoints[1];
			this.overrideDrawingPoints([{time: p2.time, price: 0}, {time: p2.time, price: 9999999}]);
		}
		super( LineVerticalDrawing.TOOL_TYPE, chart, series, symbolName, LineVerticalDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
		this.initialize(baseProps);
		if(baseProps)
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions, this.id, this.styleOptions, this.drawingPoints); 
		else
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions, this.id); 
	}

	createNewView(chart: IChartApi, series: ISeriesApi<SeriesType>): ViewBase{
        return new View(chart, series, this.toolType, this._defaultOptions, this.id, this.styleOptions, this.drawingPoints); 
    }
	
	normalizeStyleOptions(options : any){
		this.basePropsStyleOptions =normalizeLineDrawingToolOptions(options)
	}
	
	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this.view().applyOptions({ lineColor: 'rgba(100, 100, 100, 0.5)', })
		super.selected();
	}

    containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
        const options = this.styleOptions as LineDrawingToolOptions
        const offset = Math.ceil((options?.lineWidth || 1) / 2) + 3;
		return isPointNearLine(chart, series, point, points, offset);
	}

	onHoverWhenSelected(point: Point) : void {
		this._setCursor(point);
	}

	onDrag(param: MousePointAndTime, startPoint: Point, endPoint: Point): void {
		if(param.point){
			this._updatePosition(startPoint, endPoint);
		}
	}

	private _setCursor(point: Point): void{
		const isOverDrawing = this.containsPoint(this._chart!, this._series!, point, this.drawingPoints)
		document.body.style.cursor = isOverDrawing ? 'ew-resize' : 'default';
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;

		let p1 :Point, p2 : Point
		[p1, p2] = convertAndNormalizeDrawingPointsToPoint( this.drawingPoints[0], this.drawingPoints[1], this._chart, this._series)

		// adjust coordinates based on the side
		let xOffset = endPoint.x - startPoint.x;
		p1 = { x: p1.x + xOffset as Coordinate, y: p1.y as Coordinate };
		p2 = { x: p2.x + xOffset as Coordinate, y: p2.y as Coordinate };

		this.finalizeUpdatedPosition(p1, p2)
	}
}
