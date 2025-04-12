import { LinePaneView as PaneView} from '../line/line-view-pane';
import { LineDrawingToolOptions  as DrawingOptions} from '../line/line-options';

import { DrawingPoint } from '../../../common/common';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ViewBase } from '../drawing-view-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { MouseEventParams } from 'lightweight-charts';

export class LineHorizontalRay extends ViewBase {
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
		if(end){
			if(this.points[0].time > this.points[1].time){
				this.points[0] = {time: end, price: p.price};
				this.points[1] = {time: p.time, price: p.price};
			}
			else{
				this.points[1] = {time: end, price: p.price};
				this.points[0] = {time: p.time, price: p.price};
			}
		}

		this._paneViews[0].update();
		super.requestUpdate();
	}
}