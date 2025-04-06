import {
	IPrimitivePaneView,
} from 'lightweight-charts';

import { Rectangle } from '../rectangle-view';
import { ViewPoint } from '../../../../common/common';
import { RectanglePaneRenderer } from './rectangle-pane-renderer';
import { PaneViewBase } from '../../drawing-pane-view-base';

export class RectanglePaneView extends PaneViewBase implements IPrimitivePaneView {
	_source: Rectangle;
	_p1: ViewPoint = { x: null, y: null };
	_p2: ViewPoint = { x: null, y: null };

	constructor(source: Rectangle) {
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
		this._p1 = { x: x1, y: y1 };
		this._p2 = { x: x2, y: y2 };
	}

	renderer() {
		return new RectanglePaneRenderer(
			this._p1,
			this._p2,
			this._source._options.fillColor
		);
	}
}

