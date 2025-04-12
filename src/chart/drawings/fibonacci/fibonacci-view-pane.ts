import { Fibonacci } from './fibonacci-view';
import { FibonacciDrawingToolOptions } from './fibonacci-options';

import { IPrimitivePaneView } from 'lightweight-charts';
import { PaneViewBase } from '../../../chart/drawings/drawing-pane-view-base';
import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { IPrimitivePaneRenderer } from 'lightweight-charts';
import { ViewPoint } from '../../../common/points';

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

class FibonacciPaneRenderer implements IPrimitivePaneRenderer {
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

export class FibonacciPaneView extends PaneViewBase implements IPrimitivePaneView {
	private _source: Fibonacci;
	private _p1: ViewPoint = { x: null, y: null };
	private _p2: ViewPoint = { x: null, y: null };

	constructor(source: Fibonacci) {
		super();
		this._source = source;
	}

    update() {
        const { series, points, chart } = this._source;
        const timeScale = chart.timeScale();
    
        if (points.length < 2) return;
    
        const [rawPoint1, rawPoint2] = points;
    
        // Flip: always make p1 the later time (right side)
        const isReverseChronological = rawPoint1.time >= rawPoint2.time;
        const p1 = isReverseChronological ? rawPoint1 : rawPoint2;
        const p2 = isReverseChronological ? rawPoint2 : rawPoint1;
    
        this._p1 = {
            x: timeScale.timeToCoordinate(p1.time),
            y: series.priceToCoordinate(p1.price),
        };
    
        this._p2 = {
            x: timeScale.timeToCoordinate(p2.time),
            y: series.priceToCoordinate(p2.price),
        };
    }
    
	renderer() {
		const options = this._source._options as FibonacciDrawingToolOptions
		return new FibonacciPaneRenderer(
            this._p1, 
            this._p2, 
            options.color);
	}
}