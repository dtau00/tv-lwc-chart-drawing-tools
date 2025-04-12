import { RectangleDrawingToolOptions  as DrawingOptions} from './rectangle-options';
import { RectanglePaneView as PaneView} from './rectangle-view-pane';

import { DrawingPoint } from '../../../common/common';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../../../chart/drawings/drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class Rectangle extends ViewBase {
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