import { LineHorizontal as View } from './line-horizontal-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions, normalizeLineDrawingToolOptions } from '../common/options/line-options';

import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType,Coordinate} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../../../chart/drawings/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { isPointNearLine, convertAndNormalizeDrawingPointsToPoint } from '../../../common/points';
import { DrawingPoint } from '../../../common/points';
import { MAX_TIME } from '../../../common/utils/time';

export class LineHorizontalDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {

		const _finalizeDrawingPoints =()=>{
			const price =  this.drawingPoints[1].price
			const dp1 = {time : 1, price} as DrawingPoint
			const dp2 = {time : MAX_TIME, price} as DrawingPoint
			this.overrideDrawingPoints([dp1, dp2]);
		}
		super( DrawingToolType.HorizontalLine, chart, series, symbolName, LineHorizontalDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
		this.initialize(baseProps);
		if(baseProps)
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions, this.styleOptions, this.drawingPoints); 
		else
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions); 
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

	onDrag(param: MouseEventParams, startPoint: Point, endPoint: Point): void {
		if(param.point){
			this._updatePosition(startPoint, endPoint);
		}
	}

	private _setCursor(point: Point): void {
		const isOverDrawing = this.containsPoint(this._chart!, this._series!, point, this.drawingPoints)
		document.body.style.cursor = isOverDrawing ? 'ns-resize' : 'default';
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;

		// we only change the second price.  All other values are the same
		const price = this._series.coordinateToPrice(endPoint.y)!
		let dp1: DrawingPoint = { time: this.drawingPoints[0].time, price} 
		let dp2: DrawingPoint = { time: this.drawingPoints[1].time, price} 

		this.view().updatePoints([dp1, dp2]) 

		//  store new points temporarily, we will set this back to the drawingPoints when the update is finished
		// TODO we wont need this if we save directly from the class, consider adding save directly from the class
		this.tmpDrawingPoints[0] = dp1
		this.tmpDrawingPoints[1] = dp2
	}
}
