import { RectangleDrawingToolOptions  as DrawingOptions} from '../common/options/rectangle-options';
import { RectanglePaneView as PaneView} from '../common/view-panes/rectangle-view-pane';

import { DrawingPoint, MousePointAndTime } from '../../../common/points';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../../../chart/drawings/drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { MAX_TIME } from '../../../common/utils/time';

export class RectangleExtendedView extends ViewBase {
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
		if(!this.points[0] || !this.points[1]) return

		this.points[0] = p;
		let p2 = this.points[1];	
		const end =  MAX_TIME
		this.points[1] = {time: end, price: p2.price};
		/*
		const end = this.chart.timeScale().getVisibleRange()?.to
		if(end){
			this.points[1] = {time: end, price: p2.price};
		}
		*/
		this._paneViews[0].update();
		
		super.requestUpdate();
	}
}