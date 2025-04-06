
import {
	CanvasRenderingTarget2D,
	IPrimitivePaneRenderer,
} from 'lightweight-charts';
import { ViewPoint } from '../../../../common/common';

export class LinePaneRenderer implements IPrimitivePaneRenderer {
	_p1: ViewPoint;
	_p2: ViewPoint;
	_lineColor: string;
	_lineWidth: number;

	constructor(p1: ViewPoint, p2: ViewPoint, lineColor: string, lineWidth: number) {
		this._p1 = p1;
		this._p2 = p2;
		this._lineColor = lineColor;
		this._lineWidth = lineWidth;
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
			ctx.beginPath();
			ctx.moveTo(this._p1.x * xRatio, this._p1.y * yRatio);
			ctx.lineTo(this._p2.x * xRatio, this._p2.y * yRatio);
			ctx.stroke();
			ctx.restore();
		});
	}
}