import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { IPrimitivePaneRenderer } from 'lightweight-charts';
import { ViewPoint } from '../../../../common/common';

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

export class FibonacciPaneRenderer implements IPrimitivePaneRenderer {
	private _p1: ViewPoint;
	private _p2: ViewPoint;
	private _color: string;

	constructor(p1: ViewPoint, p2: ViewPoint, color: string) {
		this._p1 = p1;
		this._p2 = p2;
		this._color = color;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace(scope => {
			if (
				this._p1.x === null || this._p1.y === null ||
				this._p2.x === null || this._p2.y === null
			) return;

			const ctx = scope.context;
			const x1 = this._p1.x;
			const x2 = this._p2.x;
			const y1 = this._p1.y;
			const y2 = this._p2.y;

			const high = Math.min(y1, y2);
			const low = Math.max(y1, y2);
			const height = low - high;

			ctx.strokeStyle = this._color;
			ctx.lineWidth = 1;
			ctx.font = '10px Arial';
			ctx.fillStyle = this._color;

            const xRatio = scope.horizontalPixelRatio;
			const yRatio = scope.verticalPixelRatio;

			for (const level of FIB_LEVELS) {
				const y = low - height * level;
				ctx.beginPath();
				ctx.moveTo(x1 * xRatio, y * yRatio);
				ctx.lineTo(x2 * xRatio, y * yRatio);
				ctx.stroke();
				ctx.fillText(`${(level * 100).toFixed(1)}%`, (x2 + 4) * xRatio, (y - 2) * yRatio);
			}
		});
	}
}