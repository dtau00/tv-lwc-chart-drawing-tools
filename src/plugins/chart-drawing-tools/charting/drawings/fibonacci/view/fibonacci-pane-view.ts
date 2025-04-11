import { IPrimitivePaneView } from 'lightweight-charts';
import { Fibonacci } from '../fibonacci-view';
import { ViewPoint } from '../../../../common/common';
import { FibonacciPaneRenderer } from './fibonacci-pane-renderer';
import { PaneViewBase } from '../../drawing-pane-view-base';

export class FibonacciPaneView extends PaneViewBase implements IPrimitivePaneView {
	private _source: Fibonacci;
	private _p1: ViewPoint = { x: null, y: null };
	private _p2: ViewPoint = { x: null, y: null };

	constructor(source: Fibonacci) {
		super();
		this._source = source;
	}

    /*
	update() {
		const series = this._source.series;
		const timeScale = this._source.chart.timeScale();
		this._p1 = {
			x: timeScale.timeToCoordinate(this._source.points[0].time),
			y: series.priceToCoordinate(this._source.points[0].price),
		};
		this._p2 = {
			x: timeScale.timeToCoordinate(this._source.points[1].time),
			y: series.priceToCoordinate(this._source.points[1].price),
		};
	}*/

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
		return new FibonacciPaneRenderer(
            this._p1, 
            this._p2, 
            this._source._options.color);
	}
}