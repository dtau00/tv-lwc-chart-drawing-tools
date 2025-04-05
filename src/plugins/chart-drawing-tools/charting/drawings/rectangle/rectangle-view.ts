import { DrawingPoint } from '../../../common/common';
import { RectangleDrawingToolOptions } from './rectangle-options';
import { RectanglePaneView, } from './view/rectangle-pane-view';
import {     
    RectanglePriceAxisPaneView, 
    RectanglePriceAxisView, 
    RectangleTimeAxisPaneView, 
    RectangleTimeAxisView 
} from './view/rectangle-axis-pane-views';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType } from 'lightweight-charts';

export abstract class RectangleView extends ChartDrawingBase {
	private _initalized: boolean = false;
	_p1?: DrawingPoint | null;
	_p2?: DrawingPoint | null;
	_paneViews: RectanglePaneView[];
	_timeAxisViews: RectangleTimeAxisView[];
	_priceAxisViews: RectanglePriceAxisView[];
	_priceAxisPaneViews: RectanglePriceAxisPaneView[];
	_timeAxisPaneViews: RectangleTimeAxisPaneView[];

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		type: DrawingToolType,
		totalDrawingPoints: number,
		defaultOptions: {},
		baseProps?: ChartDrawingBaseProps,
		options: Partial<RectangleDrawingToolOptions> = {}
	) {
		super(type, chart, series, symbolName, totalDrawingPoints, defaultOptions, baseProps);
		this._options = {...defaultOptions, ...options};
		if(baseProps){ // we are loading from storage
			this.initializeDrawingViews(baseProps.drawingPoints[0], baseProps.drawingPoints[1]);
		}
	}

	abstract onClick(event: MouseEventParams): void
	abstract onMouseMove(event: MouseEventParams): void;
	abstract updatePosition(startPoint: Point, endPoint: Point): void;

	// initializes the drawing views on first click
	initializeDrawingViews(p1: DrawingPoint, p2: DrawingPoint) {
		if(this._initalized){
			console.log("rectangle already initialized", this.baseId);
			return;
		}
		this._initalized = true;
		this._p1 = p1;
		this._p2 = p2;

		this._paneViews = [new RectanglePaneView(this)];
		this._timeAxisViews = [
			new RectangleTimeAxisView(this, p1),
			new RectangleTimeAxisView(this, p2),
		];
		this._priceAxisViews = [
			new RectanglePriceAxisView(this, p1),
			new RectanglePriceAxisView(this, p2),
		];
		this._priceAxisPaneViews = [new RectanglePriceAxisPaneView(this, true)];
		this._timeAxisPaneViews = [new RectangleTimeAxisPaneView(this, false)];
	}

	updateInitialPoint(p: DrawingPoint) {
		if(!this._p1)
			return

		this._p1 = p;
		this._paneViews[0].update();
		this._timeAxisViews[1].movePoint(p);
		this._priceAxisViews[1].movePoint(p);
		super.requestUpdate();
	}

	updatePoints(p1: DrawingPoint, p2: DrawingPoint) {
		this._p1 = p1;
		this._p2 = p2;
		this._paneViews[0].update();
		this._timeAxisViews[0].movePoint(p1);
		this._timeAxisViews[1].movePoint(p2);
		this._priceAxisViews[0].movePoint(p1);
		this._priceAxisViews[1].movePoint(p2);
		super.requestUpdate();
	}

	updateAllViews() {
		if(!this._p1 || !this._p2)
			return
		this._paneViews.forEach(pw => pw.update());
		this._timeAxisViews.forEach(pw => pw.update());
		this._priceAxisViews.forEach(pw => pw.update());
		this._priceAxisPaneViews.forEach(pw => pw.update());
		this._timeAxisPaneViews.forEach(pw => pw.update());
	}

	priceAxisViews() {
		return this._priceAxisViews;
	}

	timeAxisViews() {
		return this._timeAxisViews;
	}

	paneViews() {
		return this._paneViews;
	}

	priceAxisPaneViews() {
		return this._priceAxisPaneViews;
	}

	timeAxisPaneViews() {
		return this._timeAxisPaneViews;
	}
}