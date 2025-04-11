import {
	Coordinate,
	IChartApi,
	ISeriesApi,
    MouseEventParams,
    Point,
    SeriesType
} from 'lightweight-charts';

import { LineVertical as View } from './line-vertical-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions, normalizeLineDrawingToolOptions } from '../line/line-options';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { _isPointNearLine, convertAndNormalizeDrawingPointsToPoint } from '../../../common/points';
import { DrawingPoint } from '../../../common/common';
export class LineVerticalDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...

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
		super( DrawingToolType.VerticalLine, chart, series, symbolName, LineVerticalDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
		this.initialize(baseProps);
		this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions,  baseProps?.styleOptions, baseProps || this.baseProps, this.initializeFromStorage); 
	}

	normalizeStyleOptions(options : any){
		this.styleOptions = normalizeLineDrawingToolOptions(options)
	}
	
	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this.view().applyOptions({ lineColor: 'rgba(100, 100, 100, 0.5)', })
		super.selected();
	}

    containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
        const options = this.styleOptions as LineDrawingToolOptions
        const offset = (options?.lineWidth || 1) + 3;
		return _isPointNearLine(chart, series, point, points, offset);
	}

	onHoverWhenSelected(point: Point) : void {
		this._setCursor(point);
	}

	onDrag(param: MouseEventParams, startPoint: Point, endPoint: Point): void {
		if(!param.point)
			return;

		this._updatePosition(startPoint, endPoint);
	}

	private _setCursor(point: Point): void{
		if(this.containsPoint(this._chart!, this._series!, point, this.drawingPoints)){
			document.body.style.cursor = 'ew-resize';
		}
		else{
			document.body.style.cursor = 'default';
		}
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
