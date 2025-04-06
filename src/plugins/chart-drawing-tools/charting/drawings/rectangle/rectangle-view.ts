import { DrawingPoint } from '../../../common/common';
import { RectangleDrawingToolOptions } from './rectangle-options';
import { RectanglePaneView, } from './panes/rectangle-pane-view';
import {     
    RectanglePriceAxisPaneView, 
    RectanglePriceAxisView, 
    RectangleTimeAxisPaneView, 
    RectangleTimeAxisView 
} from './panes/rectangle-axis-pane-views';
import {  ChartDrawingBaseProps } from '../chart-drawing-base';
import { IChartApi, ISeriesApi, MouseEventParams, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class Rectangle extends ViewBase {
	//private _options: Partial<RectangleDrawingToolOptions> = {};
	_p1?: DrawingPoint | null;
	_p2?: DrawingPoint | null;
	_paneViews: RectanglePaneView[];
	/* disable axis views
	_timeAxisViews: RectangleTimeAxisView[];
	_priceAxisViews: RectanglePriceAxisView[];
	_priceAxisPaneViews: RectanglePriceAxisPaneView[];
	_timeAxisPaneViews: RectangleTimeAxisPaneView[];*/
	//_baseProps: ChartDrawingBaseProps;
	_isExtended: boolean;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		toolType: DrawingToolType,
		isExtended: boolean,
		defaultOptions: {},
		options: Partial<RectangleDrawingToolOptions> = {},
		baseProps: ChartDrawingBaseProps,
		initializedFromStorage: boolean,
	) {
		super(chart, series, toolType, defaultOptions, options, baseProps);
		this._isExtended = isExtended;

		if(initializedFromStorage){ // we are loading from storage
			this.initializeDrawingViews(baseProps.drawingPoints[0], baseProps.drawingPoints[1]);
		}
	}

	// initializes the drawing views on first click
	initializeDrawingViews(p1: DrawingPoint, p2: DrawingPoint) {
		if(this.initalized)
			return;
		
		this.initalized = true;
		this._p1 = p1;
		this._p2 = p2;

		this._paneViews = [new RectanglePaneView(this)];
		/* disable axis views
		this._timeAxisViews = [
			new RectangleTimeAxisView(this, p1),
			new RectangleTimeAxisView(this, p2),
		];
		this._priceAxisViews = [
			new RectanglePriceAxisView(this, p1),
			new RectanglePriceAxisView(this, p2),
		];
		this._priceAxisPaneViews = [new RectanglePriceAxisPaneView(this, true)];
		this._timeAxisPaneViews = [new RectangleTimeAxisPaneView(this, false)];*/
	}

	updateInitialPoint(p: DrawingPoint, param: MouseEventParams) {
		if(!this._p1)
			return

		this._p1 = p;

		// if extended, modify the points for the desired extended behavior
		if(this._isExtended && this._p2){
			this._p2.time = p.time;
			const end = this.chart.timeScale().getVisibleRange()?.to
			if(end)
				this._p2.time = end
		}

		this._paneViews[0].update();
		// disable axis views
		//this._timeAxisViews[1].movePoint(p);
		//this._priceAxisViews[1].movePoint(p);

		super.requestUpdate();
	}

	updatePoints(p1: DrawingPoint, p2: DrawingPoint) {
		this._p1 = p1;
		this._p2 = p2;
		this._paneViews[0].update();
		/* disable axis views
		this._timeAxisViews[0].movePoint(p1);
		this._timeAxisViews[1].movePoint(p2);
		this._priceAxisViews[0].movePoint(p1);
		this._priceAxisViews[1].movePoint(p2);*/
		super.requestUpdate();
	}

	updateAllViews() {
		if(!this._p1 || !this._p2)
			return
		
		this._paneViews.forEach(pw => pw.update());

		// Disable the axis views
		//this._timeAxisViews.forEach(pw => pw.update());
		//this._priceAxisViews.forEach(pw => pw.update());
		//	this._priceAxisPaneViews.forEach(pw => pw.update());
		//	this._timeAxisPaneViews.forEach(pw => pw.update());
	}

	paneViews() {
		return this._paneViews;
	}

	/*
	timeAxisViews() {
		return this._timeAxisViews;
	}
	priceAxisViews() {
		return this._priceAxisViews;
	}


	priceAxisPaneViews() {
		return this._priceAxisPaneViews;
	}

	timeAxisPaneViews() {
		return this._timeAxisPaneViews;
	}*/
}