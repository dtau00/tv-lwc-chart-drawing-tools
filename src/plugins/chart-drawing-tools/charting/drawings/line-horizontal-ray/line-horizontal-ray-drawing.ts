import {
	Coordinate,
	IChartApi,
	ISeriesApi,
    MouseEventParams,
    Point,
    SeriesType,
} from 'lightweight-charts';

import { LineHorizontalRay as View } from './line-horizontal-ray-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions } from '../line/line-options';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { _isPointNearLine, convertAndNormalizeDrawingPointsToPoint } from '../../../common/points';
import { DrawingPoint } from '../../../common/common';
export class LineHorizontalRayDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private _toolType: DrawingToolType; // = DrawingToolType.Rectangle; // set the tool type for the class

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		const _finalizeDrawingPoints =()=>{
			let points = this.drawingPoints;
			const end = this._chart?.timeScale().getVisibleRange()?.to;
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

        // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS
		const toolType = DrawingToolType.HorizontalLineRay;

		super( toolType, chart, series, symbolName, LineHorizontalRayDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
		const initializeFromStorage = baseProps ? true : false;
		this._toolType = toolType
		this.drawingView = new View(chart, series, this._toolType, drawingToolDefaultOptions,  baseProps?.styleOptions, baseProps || this.baseProps, initializeFromStorage); 
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

		this._updatePosition(startPoint, endPoint);
	}

	private _setCursor(point: Point): void {
		if(this.containsPoint(this._chart!, this._series!, point, this.drawingPoints)){
			document.body.style.cursor = 'move';
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

		// Note we can't directly update the drawingPoints or the time value will be off , so always have to calculate from the initial points
		let xOffset = endPoint.x - startPoint.x;
		let yOffset = endPoint.y - startPoint.y;

		// adjust coordinates based on the side
		if(p1.x < p2.x)
			p1 = { x: p1.x + xOffset as Coordinate, y: p1.y };
		else
			p2 = { x: p2.x + xOffset as Coordinate, y: p2.y };

		p1 = { x: p1.x, y: p1.y + yOffset as Coordinate };		
		p2 = { x: p2.x, y: p2.y + yOffset as Coordinate };	

		this.finalizeUpdatedPosition(p1, p2)
	}

}
