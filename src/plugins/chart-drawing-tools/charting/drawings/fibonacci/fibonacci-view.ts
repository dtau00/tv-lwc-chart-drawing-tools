import { DrawingPoint } from '../../../common/common';
import { FibonacciPaneView } from './view/fibonacci-pane-view';
import { ChartDrawingBaseProps } from '../chart-drawing-base';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class Fibonacci extends ViewBase {
	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		toolType: DrawingToolType,
		defaultOptions: {},
		options: Partial<{ color: string }> = {},
		baseProps: ChartDrawingBaseProps,
		initializedFromStorage: boolean,
	) {
		super(chart, series, toolType, defaultOptions, options, baseProps);

		if (initializedFromStorage) {
			this.initializeDrawingViews([baseProps.drawingPoints[0], baseProps.drawingPoints[1]]);
		}
	}

	initializeDrawingViews(points: DrawingPoint[]) {
		if (this.initalized) return;
		this.initalized = true;
		this.points = points;
		this._paneViews = [new FibonacciPaneView(this)];
	}
}