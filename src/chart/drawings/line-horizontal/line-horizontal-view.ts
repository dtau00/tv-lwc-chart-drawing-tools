import { LinePaneView as PaneView} from '../../drawings/line/line-view-pane';
import { LineDrawingToolOptions as DrawingOptions } from '../../drawings/line/line-options';

import { DrawingPoint } from '../../../common/common';
import { IChartApi, ISeriesApi, MouseEventParams, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../../../chart/drawings/drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class LineHorizontal extends ViewBase {
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