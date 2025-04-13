import { Line } from '../../line/line-view';
import { LineDrawingToolOptions } from '../options/line-options';

import { Coordinate, IPrimitivePaneView, IPrimitivePaneRenderer } from 'lightweight-charts';
import { ViewPoint } from '../../../../common/points';
import { PaneViewBase } from '../../drawing-pane-view-base';
import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { timeToCoordinateMax } from '../../../../common/utils/time';
import { isValidDashFormat } from '../../../../common/utils/dash-format-string';

class LinePaneRenderer implements IPrimitivePaneRenderer {
	private _p1: ViewPoint;
	private _p2: ViewPoint;
	private _lineColor: string;
	private _lineWidth: number;
	private _lineDash: string;

	constructor(p1: ViewPoint, p2: ViewPoint, lineColor: string, lineWidth: number, lineDash: string) {
		this._p1 = p1;
		this._p2 = p2;
		this._lineColor = lineColor;
		this._lineWidth = lineWidth;
		this._lineDash = lineDash;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace(scope => {
			if (
				this._p1.x === null ||
				this._p1.y === null ||
				this._p2.x === null ||
				this._p2.y === null
			) return;

			const ctx = scope.context;
			ctx.save();

			const xRatio = scope.horizontalPixelRatio;
			const yRatio = scope.verticalPixelRatio;
			ctx.strokeStyle = this._lineColor;
			ctx.lineWidth = this._lineWidth;

			// draw ctx
			ctx.beginPath();
			if(isValidDashFormat(this._lineDash)){				
				const dash: [number, number] = JSON.parse(this._lineDash);
				ctx.setLineDash(dash);
			}
			ctx.moveTo(this._p1.x * xRatio, this._p1.y * yRatio);
			ctx.lineTo(this._p2.x * xRatio, this._p2.y * yRatio);
			ctx.stroke();
			ctx.restore();
		});
	}
}

export class LinePaneView extends PaneViewBase implements IPrimitivePaneView {
	private _source: Line;
	private _p1: ViewPoint = { x: null, y: null };
	private _p2: ViewPoint = { x: null, y: null };

	constructor(source: Line) {
		super();
		this._source = source;
	}

	/*
	update() {
		const chart = this._source.chart;
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
	*/

	update() {
		const chart = this._source.chart;
		const series = this._source.series;
		const y1 = series.priceToCoordinate(this._source.points[0].price);
		const y2 = series.priceToCoordinate(this._source.points[1].price);
		const x1 = timeToCoordinateMax(this._source.points[0].time, chart);
		const x2 = timeToCoordinateMax(this._source.points[1].time, chart);
        if(x1 !== null && y1 !== null && x2 !== null && y2 !== null){
            this._p1 = { x: Math.round(x1) as Coordinate, y: Math.round(y1) as Coordinate };
            this._p2 = { x: Math.round(x2) as Coordinate, y: Math.round(y2) as Coordinate };
        }
	}

	renderer() {
		const options = this._source._options as LineDrawingToolOptions
		return new LinePaneRenderer(
			this._p1,
			this._p2,       
			options.lineColor,
			options.lineWidth,
			options.lineDash
		);
	}
}