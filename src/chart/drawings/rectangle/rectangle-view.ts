import { RectangleDrawingToolOptions  as DrawingOptions} from '../common/options/rectangle-options';
import { RectanglePaneView as PaneView} from '../common/view-panes/rectangle-view-pane';

import { DrawingPoint, MousePointAndTime } from '../../../common/points';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../../../chart/drawings/drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class Rectangle extends ViewBase {
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

	updateInitialPoint(p: DrawingPoint, param: MousePointAndTime) {
		this.updateInitialPointForRectangle(p, param)
	}
}