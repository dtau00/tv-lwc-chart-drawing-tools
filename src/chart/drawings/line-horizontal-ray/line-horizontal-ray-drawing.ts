import { LineHorizontalRay as View } from './line-horizontal-ray-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions, normalizeLineDrawingToolOptions } from '../common/options/line-options';

import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType,Coordinate} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../../../chart/drawings/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { isPointNearLine, convertAndNormalizeDrawingPointsToPoint, isPointOverStraightLineDrawing, pointToDrawingPoints, MousePointAndTime } from '../../../common/points';
import { DrawingPoint } from '../../../common/points';
import { MAX_TIME } from '../../../common/utils/time';
import { ViewBase } from '../drawing-view-base';

export class LineHorizontalRayDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private static readonly TOOL_TYPE = DrawingToolType.HorizontalLineRay // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		super( LineHorizontalRayDrawing.TOOL_TYPE, chart, series, symbolName, LineHorizontalRayDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);
		
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
		this.view().applyOptions({ lineColor: 'rgba(100, 100, 100, 0.5)' })
		super.selected();
	}

    containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
        const options = this.styleOptions as LineDrawingToolOptions
        const offset = Math.ceil((options?.lineWidth || 1) / 2) + 3;

		return isPointNearLine(chart, series, point, points, offset);
		//return isPointOverStraightLineDrawing(point, points, chart, series, offset);
	}

	onHoverWhenSelected(point: Point) : void {
		this._setCursor(point);
	}

	setToMoving(): void{
		// this drawing only moves
	}
	
	onDrag(param: MousePointAndTime, startPoint: Point, endPoint: Point): void {
		if(param.point){
			this._updatePosition(startPoint, endPoint);
		}
	}

	protected finalizeDrawingPoints =()=>{
		let points = this.drawingPoints;
		const end = MAX_TIME//this._chart?.timeScale().getVisibleRange()?.to;
		if(end){
			const time = points[1].time
			const price = points[1].price;
			if(points[0].time > points[1].time){
				points[0] = {time: end, price};
				points[1] = {time: time, price};
			}
			else{
				points[1] = {time: end, price};
				points[0] = {time: time, price};
			}
			this.overrideDrawingPoints([points[0],points[1]]);
		}
	}

	private _setCursor(point: Point): void {
		const isOverDrawing = this.containsPoint(this._chart!, this._series!, point, this.drawingPoints)
		document.body.style.cursor = isOverDrawing ? 'move' : 'default';
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;

		let p1 :Point, p2 : Point
		[p1, p2] = convertAndNormalizeDrawingPointsToPoint( this.drawingPoints[0], this.drawingPoints[1], this._chart, this._series)

		// Note we can't directly update the drawingPoints or the time value will be off , so always have to calculate from the initial points
		let xOffset = endPoint.x - startPoint.x;
		let yOffset = endPoint.y - startPoint.y;

		// TODO Clean this up

		// adjust coordinates based on the side
		if(p1.x < p2.x)
			p1 = { x: p1.x + xOffset as Coordinate, y: p1.y };
		else
			p2 = { x: p2.x + xOffset as Coordinate, y: p2.y };

		p1 = { x: p1.x, y: p1.y + yOffset as Coordinate };		
		p2 = { x: p2.x, y: p2.y + yOffset as Coordinate };	

		// convert back to drawing coordinates
		let dp1 = pointToDrawingPoints(p1, this._chart!, this._series!)
		let dp2 = pointToDrawingPoints(p2, this._chart!, this._series!)

		// nomralize, so leftest point is first
		if (dp1.time > dp2.time) {
			[dp1, dp2] = [dp2, dp1]; // Swap if dp1 is later than dp2
		}

		// extend the line
		dp2.time = MAX_TIME

		this.view().updatePoints([dp1, dp2]) 

		this.setTmpDrawingPoints(dp1, dp2)
		//this.finalizeUpdatedPosition(p1, p2)
	}

}
