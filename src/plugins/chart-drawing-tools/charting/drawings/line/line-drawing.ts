import {
	Coordinate,
	IChartApi,
	ISeriesApi,
	MouseEventParams,
    Point,
    SeriesType,
} from 'lightweight-charts';

import { Line as View } from './line-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions } from './line-options';
import { DrawingPoint } from '../../../common/common';
import { ensureDefined } from '../../../../../helpers/assertions';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { PluginBase } from '../../../../plugin-base';
import { BoxSide, resizeBoxByHandle } from '../../../common/points';

export class LineDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private _toolType: DrawingToolType; // = DrawingToolType.Rectangle; // set the tool type for the class

	private _isExtended: boolean;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		isExtended: boolean,
		baseProps?: ChartDrawingBaseProps,
	) {
        // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS
		const toolType = isExtended ? DrawingToolType.LineExtended : DrawingToolType.Line;

		super( toolType, chart, series, symbolName, LineDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);
		this._toolType = toolType
		this._isExtended = isExtended;
		this.drawingView = new View(chart, series, this._toolType, isExtended, drawingToolDefaultOptions,  baseProps?.styleOptions, baseProps || this.baseProps, baseProps ? true : false ); 

	}

	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this._view().applyOptions({ lineColor: 'rgba(100, 100, 100, 0.5)', })
		super.select();
	}

	// revert styling when deselected
	deselect(): void {
		this._view().setBaseStyleOptions()
		super.deselect();
	}

	onClick(param: MouseEventParams) {
		if (this._isDrawing || !param.point || !param.time || !this._series) 
			return;

		const price = this._series.coordinateToPrice(param.point.y);
		if (price === null) 
			return;

		// if initial drawing is not completed, add the point
		if(!this._isCompleted){
			this._addPoint({
				time: param.time,
				price,
			});
		}
	}

	onMouseMove(param: MouseEventParams) {
		if (!this._chart || this._isDrawing || !this._series || !param.point) 
			return;

		const price = this._series.coordinateToPrice(param.point.y);
		if (price === null || param.time === undefined) 
			return;

		// if initial drawing is not completed, update the initial point
		if(!this._isCompleted){	
			this._view().updateInitialPoint({
				time: param.time,
				price,
			}, param);
		}
	}

	updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;

		// Note we can't directly update the drawingPoints or the time value will be off , so always have to calculate from the initial points
		let xOffset = endPoint.x - startPoint.x;
		let yOffset = endPoint.y - startPoint.y;

		// So we dont want to update the drawingPoints until the update is finished, we will use tmpDrawingPoints to store the new points
		const drawingPoint1 = this.drawingPoints[0];
		const drawingPoint2 = this.drawingPoints[1];

		let pricePoint1 = this._series.priceToCoordinate(drawingPoint1.price);
		let pricePoint2 = this._series.priceToCoordinate(drawingPoint2.price);
		let timePoint1 = this._chart.timeScale().timeToCoordinate(drawingPoint1.time) 
		let timePoint2 = this._chart.timeScale().timeToCoordinate(drawingPoint2.time)

		if(timePoint1 !== null && timePoint2 !== null && pricePoint1 !== null && pricePoint2 !== null){

			// assume timepoint1 is always the start of the box
			if(timePoint1 > timePoint2){
				const tmp = timePoint1;
				timePoint1 = timePoint2;
				timePoint2 = tmp;
			}

			// adjust coordinates based on the side
			if(side === 'inside'){
				timePoint1 = (timePoint1 + xOffset) as Coordinate;
				timePoint2 = (timePoint2 + xOffset) as Coordinate;
				pricePoint1 = (pricePoint1 + yOffset) as Coordinate;
				pricePoint2 = (pricePoint2 + yOffset) as Coordinate;
			}
			else{
				const newPoints = resizeBoxByHandle({x: timePoint1, y: pricePoint1}, {x: timePoint2, y: pricePoint2}, side, endPoint);
				timePoint1 = newPoints[0].x;
				timePoint2 = newPoints[1].x;
				pricePoint1 = newPoints[0].y;
				pricePoint2 = newPoints[1].y;
			}

			if(this._isExtended){
				const end = this._chart.timeScale().getVisibleRange()?.to
				if(end)
					if(timePoint2 > timePoint1)
						timePoint2 = this._chart.timeScale().timeToCoordinate(end)!
					else
						timePoint1 = this._chart.timeScale().timeToCoordinate(end)!
			}
				// convert back to drawing coordinates
			const newDrawingPoint1 = {time: this._chart.timeScale().coordinateToTime(timePoint1)!, price: this._series.coordinateToPrice(pricePoint1)!};
			const newDrawingPoint2 = {time: this._chart.timeScale().coordinateToTime(timePoint2)!, price: this._series.coordinateToPrice(pricePoint2)!};

			// update the drawing
			this._view().updatePoints( newDrawingPoint1, newDrawingPoint2) 

			//  store new points temporarily, we will set this back to the drawingPoints when the update is finished
			// TODO we wont need this if we save directly from the class, consider adding save directly from the class
			this.tmpDrawingPoints[0] = newDrawingPoint1
			this.tmpDrawingPoints[1] =newDrawingPoint2
		}
	}

	private _addPoint(p: DrawingPoint) {
		this._points.push(p);
		this._setNewDrawing();
	}

	private _setNewDrawing(){
		if(this._points.length === 1){
			this._view().initializeDrawingViews(this._points[0], this._points[0]);
			this._setStyleOptions();

			// we are only drawing this for the preview
			ensureDefined(this._series).attachPrimitive(this.drawingView as PluginBase);
		}
		else if (this._points.length >= this._totalDrawingPoints) {
			this.completeDrawing();
		}
	}

    private _view(): View {
		return this.drawingView as View;
	}

	// saves the style options to base properties for saving
	private _setStyleOptions(){
		const styleOptions = this._view().getStyleOptions();
		this.baseProps.styleOptions = styleOptions;
	}
}
