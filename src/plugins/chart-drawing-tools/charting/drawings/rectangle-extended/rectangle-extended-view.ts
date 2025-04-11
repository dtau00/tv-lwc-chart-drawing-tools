import { DrawingPoint } from '../../../common/common';
import { RectangleDrawingToolOptions } from '../rectangle/rectangle-options';
import { RectanglePaneView, } from '../rectangle/panes/rectangle-pane-view';
import {  ChartDrawingBaseProps } from '../chart-drawing-base';
import { IChartApi, ISeriesApi, MouseEventParams, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class RectangleExtendedView extends ViewBase {
	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		toolType: DrawingToolType,
		defaultOptions: {},
		options: Partial<RectangleDrawingToolOptions> = {},
		baseProps: ChartDrawingBaseProps,
		initializedFromStorage: boolean,
	) {
		super(chart, series, toolType, defaultOptions, options, baseProps);

		if(initializedFromStorage){ // we are loading from storage
			this.initializeDrawingViews([baseProps.drawingPoints[0], baseProps.drawingPoints[1]]);
		}
	}

	initializeDrawingViews(points: DrawingPoint[]) {
		if(this.initalized)
			return;
		
		this.initalized = true;
		this.points = points;

		this._paneViews = [new RectanglePaneView(this)];	
	}

		// override the base class method to extend the rectangle to the end of the chart
		updateInitialPoint(p: DrawingPoint, param: MouseEventParams) {
			if(!this.points[0])
				return
	
			this.points[0] = p;
			let p2 = this.points[1];	
			const end = this.chart.timeScale().getVisibleRange()?.to
			if(end){
				this.points[1] = {time: end, price: p2.price};
			}
	
			this._paneViews[0].update();
			super.requestUpdate();
		}
}