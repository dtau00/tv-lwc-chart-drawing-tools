import { DrawingPoint } from '../../../common/common';
import { PluginBase } from '../../../../plugin-base';
import { RectangleDrawingToolOptions, defaultOptions } from './rectangle-options';
import { RectanglePaneView, } from './view/rectangle-pane-view';
import {     
    RectanglePriceAxisPaneView, 
    RectanglePriceAxisView, 
    RectangleTimeAxisPaneView, 
    RectangleTimeAxisView 
} from './view/rectangle-axis-pane-views';

export class Rectangle extends PluginBase {
	_options: RectangleDrawingToolOptions;
	_p1: DrawingPoint;
	_p2: DrawingPoint;
	_paneViews: RectanglePaneView[];
	_timeAxisViews: RectangleTimeAxisView[];
	_priceAxisViews: RectanglePriceAxisView[];
	_priceAxisPaneViews: RectanglePriceAxisPaneView[];
	_timeAxisPaneViews: RectangleTimeAxisPaneView[];

	constructor(
		p1: DrawingPoint,
		p2: DrawingPoint,
		options: Partial<RectangleDrawingToolOptions> = {}
	) {
		super();
		this._p1 = p1;
		this._p2 = p2;
		this._options = {
			...defaultOptions,
			...options,
		};
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
		this._p2 = p;
		this._paneViews[0].update();
		this._timeAxisViews[1].movePoint(p);
		this._priceAxisViews[1].movePoint(p);
		this.requestUpdate();
	}

	updatePoints(p1: DrawingPoint, p2: DrawingPoint) {
		this._p1 = p1;
		this._p2 = p2;
		this._paneViews[0].update();
		this._timeAxisViews[0].movePoint(p1);
		this._timeAxisViews[1].movePoint(p2);
		this._priceAxisViews[0].movePoint(p1);
		this._priceAxisViews[1].movePoint(p2);
		this.requestUpdate();
	}

	updateAllViews() {
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
	
	applyOptions(options: Partial<RectangleDrawingToolOptions>) {
		this._options = { ...this._options, ...options };
		this.requestUpdate();
	}
}