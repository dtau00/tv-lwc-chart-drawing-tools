import {
	Coordinate,
	IChartApi,
	ISeriesApi,
    MouseEventParams,
    Point,
    SeriesType,
} from 'lightweight-charts';

import { Line as View } from './line-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions, normalizeLineDrawingToolOptions } from './line-options';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { _isPointNearLine, convertAndNormalizeDrawingPointsToPoint, getClosestHandleOnLine, LineHandle, offsetPoints, resizeLineByHandle } from '../../../common/points';
import { DrawingPoint } from '../../../common/common';
export class LineDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private _side : LineHandle;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		super( DrawingToolType.Line, chart, series, symbolName, LineDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);
		
		this.initialize(baseProps);
		this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions,  baseProps?.styleOptions, baseProps || this.baseProps, baseProps ? true : false ); 
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
        const options = this.drawingView?._options as LineDrawingToolOptions;  
       	const offset = (options?.lineWidth || 1) + 3;
		return _isPointNearLine(chart, series, point, points, offset);
	}

	onHoverWhenSelected(point: Point) : void {
		this._setCursor(point);
	}

	onDrag(param: MouseEventParams, startPoint: Point, endPoint: Point): void {
		if(!param.point)
			return;

		this._updatePosition(startPoint, endPoint, this._side);
	}

	private _setCursor(point: Point): void {
		// todo offset to handle thickness
		this._side = getClosestHandleOnLine(this._chart!, this._series!, this.drawingPoints[0], this.drawingPoints[1], point);
		if(this._side === null){
			document.body.style.cursor = 'default';
		}
		else if(this._side === 'middle'){
			document.body.style.cursor = 'move';
		}
		else{	
			document.body.style.cursor = 'col-resize';
		}
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point, side: LineHandle): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;

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

