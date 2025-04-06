import { Coordinate, IPrimitivePaneView } from 'lightweight-charts';
import { ViewPoint } from '../../../../common/common';
import { Line } from '../line-view';
import { LinePaneRenderer } from './line-pane-renderer';
import { PaneViewBase } from '../../drawing-pane-view-base';

export class LinePaneView extends PaneViewBase implements IPrimitivePaneView {
	_source: Line;
	_p1: ViewPoint = { x: null, y: null };
	_p2: ViewPoint = { x: null, y: null };

	constructor(source: Line) {
		super();
		this._source = source;
	}

	update() {
		const series = this._source.series;
		const y1 = series.priceToCoordinate(this._source.points[0].price);
		const y2 = series.priceToCoordinate(this._source.points[1].price);
		const timeScale = this._source.chart.timeScale();
		const x1 = timeScale.timeToCoordinate(this._source.points[0].time);
		const x2 = timeScale.timeToCoordinate(this._source.points[1].time);
        if(x1 !== null && y1 !== null && x2 !== null && y2 !== null){
            this._p1 = { x: Math.round(x1) as Coordinate, y: Math.round(y1) as Coordinate };
            this._p2 = { x: Math.round(x2) as Coordinate, y: Math.round(y2) as Coordinate };
        }
	}

	renderer() {
		return new LinePaneRenderer(
			this._p1,
			this._p2,       
			this._source._options.lineColor,
			this._source._options.lineWidth
		);
	}
}