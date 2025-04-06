import { DrawingPoint } from '../../../common/common';
import {  ChartDrawingBaseProps } from '../chart-drawing-base';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { LinePaneView } from './views/line-pane-view';
import { LineDrawingToolOptions } from './line-options';

export class Line extends ViewBase {
	_p1?: DrawingPoint | null = null;
	_p2?: DrawingPoint | null = null;

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
        if(this.initalized)
			return;

        this.initalized = true;	
        this.points = points;

        this._paneViews = [new LinePaneView(this)];
    }
}