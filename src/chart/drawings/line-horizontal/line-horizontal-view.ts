import { LinePaneView as PaneView} from '../common/view-panes/line-view-pane';
import { LineDrawingToolOptions as DrawingOptions } from '../common/options/line-options';

import { DrawingPoint, MousePointAndTime } from '../../../common/points';
import { IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts';
import { ViewBase } from '../../../chart/drawings/drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { MAX_TIME } from '../../../common/utils/time';

export class LineHorizontal extends ViewBase {
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
		if(!this.points[0]) return
		
		const end = MAX_TIME //this._chart?.timeScale().getVisibleRange()?.to;
		const start = 1 as Time //this._chart?.timeScale().getVisibleRange()?.from;
		if(end && start){
			this.points[0] = {time: start, price: p.price};
			this.points[1] = {time: end, price: p.price};
		}

		this._paneViews[0].update();
		super.requestUpdate();
	}
}