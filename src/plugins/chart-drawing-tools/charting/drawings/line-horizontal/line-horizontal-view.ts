import { DrawingPoint } from '../../../common/common';
import {  ChartDrawingBaseProps } from '../chart-drawing-base';
import { IChartApi, ISeriesApi, MouseEventParams, SeriesType, Time } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { LinePaneView } from '../line/views/line-pane-view';
import { LineDrawingToolOptions } from '../line/line-options';

export class LineHorizontal extends ViewBase {
	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		toolType: DrawingToolType,
		defaultOptions: {},
		options: Partial<LineDrawingToolOptions> = {},
		baseProps: ChartDrawingBaseProps,
		initializedFromStorage: boolean,
	) {

		super(chart, series, toolType, defaultOptions, options, baseProps);

		if(initializedFromStorage){ // we are loading from storage
			this.initializeDrawingViews([baseProps.drawingPoints[0], baseProps.drawingPoints[1]]);
		}
	}

	// make sure you pass in the correct number of points for your drawing
	// TODO enfore this
	initializeDrawingViews(points: DrawingPoint[]) {
		if(this._paneViews.length > 0)
			return;

		this.points = points;
		this._paneViews = [new LinePaneView(this)];
	}

	// override the base class method to extend the vertical line
	updateInitialPoint(p: DrawingPoint, param: MouseEventParams) {
		if(!this.points[0])
			return
		const end = this._chart?.timeScale().getVisibleRange()?.to;
		const start = this._chart?.timeScale().getVisibleRange()?.from;
		if(end && start){
			this.points[0] = {time: start, price: p.price};
			this.points[1] = {time: end, price: p.price};
		}

		this._paneViews[0].update();
		super.requestUpdate();
	}
}