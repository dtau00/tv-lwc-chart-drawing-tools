
import { DrawingPoint } from '../../common/common';
import { Rectangle } from './rectangle';
import { RectangleDrawingToolOptions } from './rectangle-options';

export class PreviewRectangle extends Rectangle {
	constructor(
		p1: DrawingPoint,
		p2: DrawingPoint,
		options: Partial<RectangleDrawingToolOptions> = {}
	) {
		super(p1, p2, options);
		this._options.fillColor = this._options.previewFillColor;
	}

	public updateEndPoint(p: DrawingPoint) {
		this._p2 = p;
		this._paneViews[0].update();
		this._timeAxisViews[1].movePoint(p);
		this._priceAxisViews[1].movePoint(p);
		this.requestUpdate();
	}
}