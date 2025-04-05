import {
	Coordinate,
	IChartApi,
	ISeriesApi,
	MouseEventParams,
    Point,
    SeriesType,
} from 'lightweight-charts';

import { DrawingPoint } from '../../../common/common';
import { ensureDefined } from '../../../../../helpers/assertions';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { RectangleView } from './rectangle-view';
import { rectangleDrawingToolDefaultOptions } from './rectangle-options';
import { PluginBase } from '../../../../plugin-base';

export class RectangleDrawing extends ChartDrawingBase{
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
		const toolType = isExtended ? DrawingToolType.RectangleExtended : DrawingToolType.Rectangle;
		super( toolType, chart, series, symbolName, RectangleDrawing.TOTAL_DRAWING_POINTS, rectangleDrawingToolDefaultOptions, baseProps);
		this._toolType = toolType
		this._isExtended = isExtended;
		this.drawingView = new RectangleView(chart, series, this._toolType, isExtended, rectangleDrawingToolDefaultOptions,  baseProps?.styleOptions, baseProps); 

	}

	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this._view().applyOptions({ fillColor: 'rgba(100, 100, 100, 0.5)', })
		super.select();
	}

	// revert styling when deselected
	deselect(): void {
		this._view().setBaseStyleOptions()//.setToConfiguredStyle();
		super.deselect();
	}

	onClick(param: MouseEventParams) {
		if (this._isDrawing || !param.point || !param.time || !this._series) 
			return;

		const price = this._series.coordinateToPrice(param.point.y);
		if (price === null) 
			return;

		if(this._isCompleted){

		}
		else{
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

	updatePosition(startPoint: Point, endPoint: Point): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;
		// Note we can't directly update the drawingPoints or the time value will be off , so always have to calculate from the initial points
		let xOffset = endPoint.x - startPoint.x;
		let yOffset = endPoint.y - startPoint.y;

		// So we dont want to update the drawingPoints until the update is finished, we will use tmpDrawingPoints to store the new points
		const drawingPoint1 = this.drawingPoints[0];
		const drawingPoint2 = this.drawingPoints[1];

		// convert to coordinates
		let pricePoint1 = this._series.priceToCoordinate(drawingPoint1.price);
		let pricePoint2 = this._series.priceToCoordinate(drawingPoint2.price);
		let timePoint1 = this._chart.timeScale().timeToCoordinate(drawingPoint1.time) 
		let timePoint2 = this._chart.timeScale().timeToCoordinate(drawingPoint2.time)

		if(timePoint1 !== null && timePoint2 !== null && pricePoint1 !== null && pricePoint2 !== null){
			// offset coordinates
			timePoint1 = (timePoint1 + xOffset) as Coordinate;
			timePoint2 = (timePoint2 + xOffset) as Coordinate;
			pricePoint1 = (pricePoint1 + yOffset) as Coordinate;
			pricePoint2 = (pricePoint2 + yOffset) as Coordinate;

			if(this._isExtended){
				const end = this._chart.timeScale().getVisibleRange()?.to
				if(end)
					timePoint2 = this._chart.timeScale().timeToCoordinate(end)!
			}
				// convert back to drawing coordinates
			const newDrawingPoint1 = {time: this._chart.timeScale().coordinateToTime(timePoint1)!, price: this._series.coordinateToPrice(pricePoint1)!};
			const newDrawingPoint2 = {time: this._chart.timeScale().coordinateToTime(timePoint2)!, price: this._series.coordinateToPrice(pricePoint2)!};

			// update the drawing
			this._view().updatePoints( newDrawingPoint1, newDrawingPoint2) 

			//  store new points temporarily, we will set this back to the drawingPoints when the update is finished
			// TODO we wont need this if we save directly from the class, consider adding save directly from the class
			this.tmpDrawingPoints[0] = newDrawingPoint1;
			this.tmpDrawingPoints[1] = newDrawingPoint2;
		}
	}

	private _view(): RectangleView {
		return this.drawingView as RectangleView;
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

	// saves the style options to base properties for saving
	private _setStyleOptions(){
		const styleOptions = this._view().getStyleOptions();
		this.baseProps.styleOptions = styleOptions;
	}
}