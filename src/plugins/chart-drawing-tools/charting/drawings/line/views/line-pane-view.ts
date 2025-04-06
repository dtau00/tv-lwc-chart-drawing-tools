import { IPrimitivePaneView } from 'lightweight-charts';
import { ViewPoint } from '../../../../common/common';
import { Line } from '../line-view';
import { LinePaneRenderer } from './line-pane-renderer';

export class LinePaneView implements IPrimitivePaneView {
	_source: Line;
	_p1: ViewPoint = { x: null, y: null };
	_p2: ViewPoint = { x: null, y: null };

	constructor(source: Line) {
		this._source = source;
	}

	update() {
		const series = this._source.series;
		const y1 = series.priceToCoordinate(this._source._p1.price);
		const y2 = series.priceToCoordinate(this._source._p2.price);
		const timeScale = this._source.chart.timeScale();
		const x1 = timeScale.timeToCoordinate(this._source._p1.time);
		const x2 = timeScale.timeToCoordinate(this._source._p2.time);
		this._p1 = { x: Math.round(x1), y: Math.round(y1) };
		this._p2 = { x: Math.round(x2), y: Math.round(y2) };
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