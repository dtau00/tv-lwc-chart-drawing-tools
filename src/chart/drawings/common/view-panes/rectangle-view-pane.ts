
import { Rectangle } from '../../rectangle/rectangle-view'
import { RectangleDrawingToolOptions as DrawingOptions } from '../options/rectangle-options';

import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { IPrimitivePaneRenderer, IPrimitivePaneView } from 'lightweight-charts';
import { positionsBox } from '../../../../common/utils/dimensions/positions';
import { ViewPoint } from '../../../../common/points';
import { PaneViewBase } from '../../../../chart/drawings/drawing-pane-view-base';
import { timeToCoordinateMax } from '../../../../common/utils/time';

class RectanglePaneRenderer implements IPrimitivePaneRenderer {
	private _p1: ViewPoint;
	private _p2: ViewPoint;
	private _fillColor: string;
	private _text: string;
	private _strokeColor: string;

	constructor(p1: ViewPoint, p2: ViewPoint, fillColor: string, strokeColor: string, text: string) {
		this._p1 = p1;
		this._p2 = p2;
		this._fillColor = fillColor;
		this._strokeColor = strokeColor;
		this._text = text;
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

			const xRatio = scope.horizontalPixelRatio;
			const yRatio = scope.verticalPixelRatio;

			const ctx = scope.context;
			const horizontalPositions = positionsBox(this._p1.x, this._p2.x, xRatio);
			const verticalPositions = positionsBox(this._p1.y, this._p2.y, yRatio);

			console.log('stroking', this._fillColor, this._strokeColor)
			if(this._fillColor){
				ctx.fillStyle = this._fillColor;
				ctx.fillRect(
					horizontalPositions.position,
					verticalPositions.position,
					horizontalPositions.length,
					verticalPositions.length
				);
			}

			if(this._strokeColor){
				ctx.strokeStyle = this._strokeColor;
				ctx.strokeRect(
					horizontalPositions.position,
					verticalPositions.position,
					horizontalPositions.length,
					verticalPositions.length
				);
			}

			// add text to ctx
			if(this._text){
				ctx.font = "12px Arial"; 
				ctx.fillStyle = this._fillColor || this._strokeColor
				ctx.fillText(this._text, this._p1.x * xRatio,(this._p1.y * yRatio) - 4);
			}
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
		const options = this._source._options as DrawingOptions
		return new RectanglePaneRenderer(
			this._p1,
			this._p2,
			options.fillColor,
			options.strokeColor,
			options.text
		);
	}
}

