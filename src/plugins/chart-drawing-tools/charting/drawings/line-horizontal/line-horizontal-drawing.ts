import {
	Coordinate,
	IChartApi,
	ISeriesApi,
    MouseEventParams,
    Point,
    SeriesType,
} from 'lightweight-charts';

import { LineHorizontal as View } from './line-horizontal-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions, LineDrawingToolOptions } from '../line/line-options';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { _isPointNearLine, BoxSide } from '../../../common/points';
import { DrawingPoint } from '../../../common/common';
export class LineHorizontalDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private _toolType: DrawingToolType; // = DrawingToolType.Rectangle; // set the tool type for the class

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

        // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS
		const toolType = DrawingToolType.HorizontalLine;

		super( toolType, chart, series, symbolName, LineHorizontalDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
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
			document.body.style.cursor = 'ns-resize';
		}
		else{
			document.body.style.cursor = 'default';
		}
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;

		// Note we can't directly update the drawingPoints or the time value will be off , so always have to calculate from the initial points
		let yOffset = endPoint.y - startPoint.y;

		// So we dont want to update the drawingPoints until the update is finished, we will use tmpDrawingPoints to store the new points
		const drawingPoint1 = this.drawingPoints[0];
		const drawingPoint2 = this.drawingPoints[1];

		let pricePoint1 = this._series.priceToCoordinate(drawingPoint1.price);
		let pricePoint2 = this._series.priceToCoordinate(drawingPoint2.price);
		let timePoint1 = this._chart.timeScale().timeToCoordinate(drawingPoint1.time) 
		let timePoint2 = this._chart.timeScale().timeToCoordinate(drawingPoint2.time)

		let p1 = {x: timePoint1, y: pricePoint1};
		let p2 = {x: timePoint2, y: pricePoint2};

		if(p1.x !== null && p2.x !== null && p1.y !== null && p2.y !== null){
			// adjust coordinates based on the side
				if(p1.x !== null && p2.x !== null && p1.y !== null && p2.y !== null){
					p1.y = (p1.y + yOffset) as Coordinate;
					p2.y = (p2.y + yOffset) as Coordinate;
				}

            // convert back to drawing coordinates
            if(p1.x !== null && p2.x !== null && p1.y !== null && p2.y !== null){
                const newDrawingPoint1 = {time: this._chart.timeScale().coordinateToTime(p1.x)!, price: this._series.coordinateToPrice(p1.y)!};
                const newDrawingPoint2 = {time: this._chart.timeScale().coordinateToTime(p2.x)!, price: this._series.coordinateToPrice(p2.y)!};

                // update the drawing
                this.view().updatePoints([newDrawingPoint1, newDrawingPoint2]) 

                //  store new points temporarily, we will set this back to the drawingPoints when the update is finished
                // TODO we wont need this if we save directly from the class, consider adding save directly from the class
                this.tmpDrawingPoints[0] = newDrawingPoint1
                this.tmpDrawingPoints[1] = newDrawingPoint2
            }
		}
	}
}
