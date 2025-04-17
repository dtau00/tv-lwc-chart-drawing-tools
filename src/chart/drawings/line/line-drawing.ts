import { Line as View } from './line-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions, normalizeLineDrawingToolOptions } from '../common/options/line-options';

import { IChartApi, ISeriesApi, Point, SeriesType,} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../../../chart/drawings/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { isPointNearLine, convertAndNormalizeDrawingPointsToPoint, getClosestHandleOnLine, LineHandle, offsetPoints, resizeLineByHandle, MousePointAndTime } from '../../../common/points';
import { DrawingPoint } from '../../../common/points';
import { ViewBase } from '../drawing-view-base';

export class LineDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private static readonly TOOL_TYPE = DrawingToolType.Line // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS
	private _side! : LineHandle;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		super( LineDrawing.TOOL_TYPE, chart, series, symbolName, LineDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);
		
		this.initialize(baseProps);
	}

	createNewView(chart: IChartApi, series: ISeriesApi<SeriesType>): ViewBase{
        return new View(chart, series, this.toolType, this._defaultOptions, this.id, this.styleOptions, this.drawingPoints); 
    }
	
	normalizeStyleOptions(options : any){
		this.basePropsStyleOptions = normalizeLineDrawingToolOptions(options)
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

	setToMoving(): void{
		this._side = 'middle' 
	}

	onDrag(param: MousePointAndTime, startPoint: Point, endPoint: Point): void {
		if(param.point){
			this._updatePosition(startPoint, endPoint, this._side);
		}
	}

	protected finalizeDrawingPoints =()=>{
		// nothing to do
	}
	
	private _setCursor(point: Point): void {
		// todo offset to handle thickness
		this._side = getClosestHandleOnLine(this._chart!, this._series!, this.drawingPoints[0], this.drawingPoints[1], point);
		if(this._side === null){
			document.body.style.cursor = 'default';
		}
		else if(this._side === 'middle'){
			// document.body.style.cursor = 'move';
		}
		else{
			document.body.style.cursor = 'col-resize';
		}
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point, side: LineHandle): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) return;

		let p1 :Point, p2 : Point
		[p1, p2] = convertAndNormalizeDrawingPointsToPoint( this.drawingPoints[0], this.drawingPoints[1], this._chart, this._series)

		// adjust coordinates based on the side
		if(side === 'middle'){
			[p1, p2] =offsetPoints(startPoint, endPoint, p1, p2)
		}
		else{
			[p1, p2] = resizeLineByHandle(
				{ x: p1.x, y: p1.y },
				{ x: p2.x, y: p2.y },
				side,
				endPoint
			);
		}

		this.finalizeUpdatedPosition(p1, p2)
	}
}

