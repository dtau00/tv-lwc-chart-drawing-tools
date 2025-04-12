import { FibonacciPaneView as PaneView} from './fibonacci-view-pane';
import { FibonacciDrawingToolOptions as DrawingOptions} from './fibonacci-options';

import { DrawingPoint } from '../../../common/common';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class Fibonacci extends ViewBase {
	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		toolType: DrawingToolType,
		defaultOptions: {},
		options: Partial<DrawingOptions> = {},
		drawingPoints?: DrawingPoint[]
	) {

		super(chart, series, toolType, defaultOptions, options);

		this.initializeDrawingViews(drawingPoints);
	}

	initializeDrawingViews(points?: DrawingPoint[]) {
		if(points?.length && this.paneViews.length === 0){
			this.points = points;
			this._paneViews = [new PaneView(this)];
		}
	}
}