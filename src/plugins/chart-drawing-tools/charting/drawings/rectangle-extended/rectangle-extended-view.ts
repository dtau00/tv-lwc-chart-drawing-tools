import { RectangleDrawingToolOptions  as DrawingOptions} from '../rectangle/rectangle-options';
import { RectanglePaneView as PaneView} from '../rectangle/rectangle-view-pane';

import { DrawingPoint } from '../../../common/common';
import { IChartApi, ISeriesApi, MouseEventParams, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';

export class RectangleExtendedView extends ViewBase {
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

	// override the base class method to extend the rectangle to the end of the chart
	updateInitialPoint(p: DrawingPoint, param: MouseEventParams) {
		if(!this.points[0] || !this.points[1]){
			return
		}

		this.points[0] = p;
		let p2 = this.points[1];	
		const end = this.chart.timeScale().getVisibleRange()?.to
		if(end){
			this.points[1] = {time: end, price: p2.price};
		}

		this._paneViews[0].update();
		
		super.requestUpdate();
	}
}