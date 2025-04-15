import { LinePaneView as PaneView} from '../common/view-panes/line-view-pane';
import { LineDrawingToolOptions  as DrawingOptions} from '../common/options/line-options';

import { DrawingPoint, MousePointAndTime } from '../../../common/points';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../../../chart/drawings/drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { MouseEventParams } from 'lightweight-charts';

export class LineVertical extends ViewBase {
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

	initializeDrawingViews(points?: DrawingPoint[]) {
		if(points?.length && this.paneViews.length === 0){
			this.points = points;
			this._paneViews = [new PaneView(this)];
		}
	}

	// override the base class method to extend the vertical line
	updateInitialPoint(p: DrawingPoint, param: MousePointAndTime) {
		if(!this.points[0])
			return

		this.points[0] = {time: p.time, price: 0};
		this.points[1] = {time: p.time, price: 9999999};

		this._paneViews[0].update();
		super.requestUpdate();
	}
}