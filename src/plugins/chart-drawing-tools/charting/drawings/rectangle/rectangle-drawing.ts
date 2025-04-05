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
import { ChartDrawing, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { Rectangle } from './rectangle';
import { defaultOptions, RectangleDrawingToolOptions } from './rectangle-options';
import { PluginBase } from '../../../../plugin-base';

export class RectangleDrawing extends ChartDrawing{
	private static readonly TotalDrawingPoints = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...

	private readonly _toolType: DrawingToolType = DrawingToolType.Rectangle;
	private _defaultOptions: Partial<RectangleDrawingToolOptions>;
	private _currentFillColor: string;
	//private _previewDrawing: PreviewRectangle | undefined = undefined;
	//private _chartDrawing: Rectangle | undefined = undefined;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		super(DrawingToolType.Rectangle, chart, series, symbolName, RectangleDrawing.TotalDrawingPoints, baseProps);
		
		if(baseProps){ // recreate the chartDrawing object, from loaded data
			new Rectangle({time: this.startDate, price: this.startPrice}, {time: this.endDate, price: this.endPrice}, { ...this.baseProps.styleOptions }); 
			this._initializeChartDrawing()
		}
	}

	// there should probably be default implemetations for lines and boxes.  The styling can be funky and hard to control
	// Ideally we'll outline the primative or something.  Perhaps implement a DrawingSelected object like Preview
	select(): void {
		this._currentFillColor = this.getRgbaOverrideColorFromOptions<RectangleDrawingToolOptions>(this._toolType, 'fillColor', 'opacity', defaultOptions);
		(this._baseDrawing as Rectangle)?.applyOptions({
			fillColor: 'rgba(100, 100, 100, 0.5)',
		})
		super.select();
	}

	deselect(): void {
		this.removePreviewDrawing();
		if(this._currentFillColor){
			(this._baseDrawing as Rectangle)?.applyOptions({
				fillColor: this._currentFillColor
			})
		}
		super.deselect();
	}

	onClick(param: MouseEventParams) {
		if (this._isDrawing || !param.point || !param.time || !this._series) 
			return;

		const price = this._series.coordinateToPrice(param.point.y);
		if (price === null) 
			return;

		if(this._isCompleted){
			alert("completed");
			// two states, selected, and move
			// first click to select
			// then depending on where you click the drawing, it will move
		}
		else{
			this._addPoint({
				time: param.time,
				price,
			});
		}
	}

	// TODO: remove this handler if drawing is completed.  this is only for preview
	onMouseMove(param: MouseEventParams) {
		if (!this._chart || this._isDrawing || !this._series || !param.point) 
			return;
		//console.log('drawing onMouseMove', param);
		const price = this._series.coordinateToPrice(param.point.y);
		if (price === null || param.time === undefined) 
			return;

		if(!this._isCompleted){
			(this._baseDrawing as Rectangle)?.updateInitialPoint({
				time: param.time,
				price,
			});
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
			timePoint2 =(timePoint2 + xOffset) as Coordinate;
			pricePoint1 = (pricePoint1 + yOffset) as Coordinate;
			pricePoint2 = (pricePoint2 + yOffset) as Coordinate;

			// convert back to drawing coordinates
			const newDrawingPoint1 = {time: this._chart.timeScale().coordinateToTime(timePoint1)!, price: this._series.coordinateToPrice(pricePoint1)!};
			const newDrawingPoint2 = {time: this._chart.timeScale().coordinateToTime(timePoint2)!, price: this._series.coordinateToPrice(pricePoint2)!};

			// update the drawing
			(this._baseDrawing as Rectangle)?.updatePoints( newDrawingPoint1, newDrawingPoint2) 

			//  store new points temporarily, we will set this back to the drawingPoints when the update is finished
			this.tmpDrawingPoints[0] = newDrawingPoint1;
			this.tmpDrawingPoints[1] = newDrawingPoint2;
		}
	}

	private _initializeChartDrawing(p1?: DrawingPoint, p2?: DrawingPoint) {
		if(!p1 || !p2){
			p1  = {time: this.startDate, price: this.startPrice || 0};
			p2 = {time: this.endDate, price: this.endPrice || 0};
		}
		const options = this._options(this._baseProps.styleOptions);
		this._baseProps.styleOptions = options
		this._baseDrawing = new Rectangle(p1, p2, { ...options });
		//ensureDefined(this._series).attachPrimitive(this._chartDrawing); // we let the chart manager manage the primative
	}

	private _addPoint(p: DrawingPoint) {
		this._points.push(p);
		this._setNewDrawing();
	}

	private _setNewDrawing(){
		if(this._points.length === 1){
			this._initializeChartDrawing(this._points[0], this._points[0]);
			// we are only drawing this for the preview
			ensureDefined(this._series).attachPrimitive(this._baseDrawing as PluginBase);
		}
		else if (this._points.length >= this._totalDrawingPoints) {
			//this._createChartDrawing(this._points[0], this._points[1]);
			this.completeDrawing();
			//ensureDefined(this._series).detachPrimitive(this._baseDrawing as PluginBase);
		}
	}

	// gets the override options for styling.  there could be special processing for some settings
	private _options(styleOptions: {}): Partial<RectangleDrawingToolOptions> {
		let  overrides = super.getOverrideOptions<RectangleDrawingToolOptions>(this._toolType, styleOptions);
		overrides.fillColor = this.getRgbaOverrideColorFromOptions<RectangleDrawingToolOptions>(this._toolType, 'fillColor', 'opacity', defaultOptions, overrides);
		return overrides;
	}
}