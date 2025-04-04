import {
	IChartApi,
	ISeriesApi,
	MouseEventParams,
    SeriesType,
} from 'lightweight-charts';

import { DrawingPoint } from '../../../common/common';
import { ensureDefined } from '../../../../../helpers/assertions';
import { ChartDrawing, ChartDrawingBaseProps } from '../base/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/drawing-tools';
import { PreviewRectangle } from './rectangle-preview';
import { Rectangle } from './rectangle';
import { defaultOptions, RectangleDrawingToolOptions } from './rectangle-options';

export class RectangleDrawing extends ChartDrawing{
	private static readonly drawingPoints = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...

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
		super(DrawingToolType.Rectangle, chart, series, symbolName, RectangleDrawing.drawingPoints, baseProps);

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

	onMouseMove(param: MouseEventParams) {
		if (!this._chart || this._isDrawing || !this._series || !param.point) 
			return;
/*
		const point = getChartPointFromMouseEvent(evt, this._chart);
		if(!point) return;
		
		const price = this._series.coordinateToPrice(point.y);
		const time = this._chart.timeScale().coordinateToTime(point.x);
		if (price === null || !time) 
			return;

		(this._previewDrawing as PreviewRectangle)?.updateEndPoint({
			time: time,
			price,
		});
		*/

		const price = this._series.coordinateToPrice(param.point.y);
		if (price === null || param.time === undefined) 
			return;

		(this._previewDrawing as PreviewRectangle)?.updateEndPoint({
			time: param.time,
			price,
		});
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

	// creates the chartDrawing object and primative, but doesn't attach the drawing to a chart.  Will let mgr handle that
	private _createChartDrawing	(p1: DrawingPoint, p2: DrawingPoint) {
		this._initializeChartDrawing(p1, p2);
		this.completeDrawing();
	}

	// NOTE the preview behaves differently than the chartDrawing primative.  The chartDrawing is managed by the
	// chart manager, and the drawing is applied onto the chartContainer.  
	// For the preview, the primative is attached by this object, directly onto the chart it's initialized with
	// This is obviously weird, and the las piece of coupling of the chart and series objects.  This code follows
	// the example provided by Trading View, so we'll have to really consider how and if we should decouple it
	// for now, funcitonally it shouldnt have a problem, since there can only be one active chart, and therefore preview
	// at a time.
	private _createPreviewDrawing(p: DrawingPoint) {
		this._previewDrawing = new PreviewRectangle(p, p, {
			...this._defaultOptions,
		});
		ensureDefined(this._series).attachPrimitive(this._previewDrawing);
	}

	private _addPoint(p: DrawingPoint) {
		this._points.push(p);
		if (this._points.length === 1) {
			this._createPreviewDrawing(this._points[0]);
		}
		else if (this._points.length >= this._totalDrawingPoints) {
			this._createChartDrawing(this._points[0], this._points[1]);
		}
	}

	// gets the override options for styling.  there could be special processing for some settings
	private _options(styleOptions: {}): Partial<RectangleDrawingToolOptions> {
		let  overrides = super.getOverrideOptions<RectangleDrawingToolOptions>(this._toolType, styleOptions);
		overrides.fillColor = this.getRgbaOverrideColorFromOptions<RectangleDrawingToolOptions>(this._toolType, 'fillColor', 'opacity', defaultOptions, overrides);
		return overrides;
	}
}