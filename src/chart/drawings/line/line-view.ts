import { LinePaneView as PaneView} from '../common/view-panes/line-view-pane';
import { LineDrawingToolOptions  as DrawingOptions} from '../common/options/line-options';

import { DrawingPoint, MousePointAndTime } from '../../../common/points';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../../../chart/drawings/drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class Line extends ViewBase {
	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		toolType: DrawingToolType,
		defaultOptions: {},
		drawingId: string,
		options: Partial<DrawingOptions> = {},
		drawingPoints?: DrawingPoint[]
	) {

		super(chart, series, toolType, defaultOptions, options, drawingId);

		this.initializeDrawingViews(drawingPoints);
	}

	initializeDrawingViews(points?: DrawingPoint[]): void {
		if (!points?.length || this.paneViews.length > 0) return;
	
		this.points = points;
		this._paneViews = [new PaneView(this)];
	}

	// override the base class method to extend the vertical line
	updateInitialPoint(p: DrawingPoint, param: MousePointAndTime) {
		this.updateInitialPointForRectangle(p, param)
	}
}