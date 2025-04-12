import { LineHorizontal as View } from './line-horizontal-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions, normalizeLineDrawingToolOptions } from '../line/line-options';

import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType,Coordinate} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { isPointNearLine, convertAndNormalizeDrawingPointsToPoint } from '../../../common/points';
import { DrawingPoint } from '../../../common/common';
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
			const end = this._chart?.timeScale().getVisibleRange()?.to;
			const start = this._chart?.timeScale().getVisibleRange()?.from;
			if(end && start){
				this.overrideDrawingPoints([{time: start, price}, {time: end, price}]);
			}
		}
		super( DrawingToolType.HorizontalLine, chart, series, symbolName, LineHorizontalDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
		this.initialize(baseProps);
		if(baseProps)
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions, this.styleOptions, this.drawingPoints); 
		else
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions); 
	}

	normalizeStyleOptions(options : any){
		this.baseProps.styleOptions = normalizeLineDrawingToolOptions(options)
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

		let p1 :Point, p2 : Point
		[p1, p2] = convertAndNormalizeDrawingPointsToPoint( this.drawingPoints[0], this.drawingPoints[1], this._chart, this._series)

		// adjust coordinates based on the side
		let yOffset = endPoint.y - startPoint.y;
		p1 = { x: p1.x, y: (p1.y + yOffset) as Coordinate };
		p2 = { x: p2.x, y: (p2.y + yOffset) as Coordinate };
	
		this.finalizeUpdatedPosition(p1, p2)
	}
}
