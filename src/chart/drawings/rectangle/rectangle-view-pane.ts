
import { Rectangle } from './rectangle-view';
import { RectangleDrawingToolOptions } from './rectangle-options';

import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { Coordinate, IPrimitivePaneRenderer, IPrimitivePaneView } from 'lightweight-charts';
import { positionsBox } from '../../../common/utils/dimensions/positions';
import { ViewPoint } from '../../../common/points';
import { PaneViewBase } from '../../../chart/drawings/drawing-pane-view-base';
import { timeToCoordinateMax } from '../../../common/utils/time';

class RectanglePaneRenderer implements IPrimitivePaneRenderer {
	private _p1: ViewPoint;
	private _p2: ViewPoint;
	private _fillColor: string;

	constructor(p1: ViewPoint, p2: ViewPoint, fillColor: string) {
		this._p1 = p1;
		this._p2 = p2;
		this._fillColor = fillColor;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace(scope => {
			if (
				this._p1.x === null ||
				this._p1.y === null ||
				this._p2.x === null ||
				this._p2.y === null
			)
				return;
			const ctx = scope.context;
			const horizontalPositions = positionsBox(
				this._p1.x,
				this._p2.x,
				scope.horizontalPixelRatio
			);
			const verticalPositions = positionsBox(
				this._p1.y,
				this._p2.y,
				scope.verticalPixelRatio
			);
			ctx.fillStyle = this._fillColor;
			ctx.fillRect(
				horizontalPositions.position,
				verticalPositions.position,
				horizontalPositions.length,
				verticalPositions.length
			);
		});
	}
}

export class RectanglePaneView extends PaneViewBase implements IPrimitivePaneView {
	private _source: Rectangle;
	private _p1: ViewPoint = { x: null, y: null };
	private _p2: ViewPoint = { x: null, y: null };

	constructor(source: Rectangle) {
		super();
		this._source = source;
	}

	/*
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
*/

	update() {
		const chart = this._source.chart
		const series = this._source.series;
		const price1 = this._source.points[0].price;
		const price2 = this._source.points[1].price;
		const time1 = this._source.points[0].time;
		const time2 = this._source.points[1].time;

		const y1 = series.priceToCoordinate(price1);
		const y2 = series.priceToCoordinate(price2);
		let x1 = timeToCoordinateMax(time1, chart)
		let x2 = timeToCoordinateMax(time2, chart)

		if (x1 === null || x2 === null || y1 === null || y2 === null || x1 <= 0 || x2 <= 0)
			return;

		this._p1 = { x: x1, y: y1 };
		this._p2 = { x: x2, y: y2 };
	}

	renderer() {
		const options = this._source._options as RectangleDrawingToolOptions
		return new RectanglePaneRenderer(
			this._p1,
			this._p2,
			options.fillColor
		);
	}
}

