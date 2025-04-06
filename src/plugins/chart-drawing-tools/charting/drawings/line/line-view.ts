import { DrawingPoint, ViewPoint } from '../../../common/common';
import {  ChartDrawingBaseProps } from '../chart-drawing-base';
import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { LinePaneView } from './views/line-pane-view';
import { LineDrawingToolOptions } from './line-options';

export class Line extends ViewBase {
	_p1?: DrawingPoint | null = null;
	_p2?: DrawingPoint | null = null;
	_isExtended: boolean;
    _paneViews: LinePaneView[];

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		toolType: DrawingToolType,
		isExtended: boolean,
		defaultOptions: {},
		options: Partial<LineDrawingToolOptions> = {},
		baseProps: ChartDrawingBaseProps,
		initializedFromStorage: boolean,
	) {

		super(chart, series, toolType, defaultOptions, options, baseProps);
		this._isExtended = isExtended;

		if(initializedFromStorage){ // we are loading from storage
			this.initializeDrawingViews([baseProps.drawingPoints[0], baseProps.drawingPoints[1]]);
		}
	}

		// make sure you pass in the correct number of points for your drawing
	// TODO enfore this
    initializeDrawingViews(points: DrawingPoint[]) {
        if(this.initalized)
			return;

        this.initalized = true;
        this._p1 = points[0];
        this._p2 = points[1];

        this._paneViews = [new LinePaneView(this)];
    }

    updateInitialPoint(p: DrawingPoint, param: MouseEventParams) {
		if(!this._p1)
			return

		this._p1 = p;
		this._paneViews[0].update();
		super.requestUpdate();
	}

	// update the points for the drawing, make sure you pass in the correct number of points
	// TODO enforce the proper number of points
    updatePoints(points: DrawingPoint[]) {
		this._p1 = points[0];
		this._p2 = points[1];
		this._paneViews[0].update();
		super.requestUpdate();
	}

	updateAllViews() {
        if(!this._p1 || !this._p2)
			return
        
		this._paneViews.forEach(pv => pv.update());
	}

	paneViews() {
		return this._paneViews;
	}
}