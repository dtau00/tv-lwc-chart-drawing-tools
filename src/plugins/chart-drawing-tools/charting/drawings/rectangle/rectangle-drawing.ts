import { Rectangle as View } from './rectangle-view';
import { rectangleDrawingToolDefaultOptions as drawingToolDefaultOptions, normalizeRectangleDrawingToolOptions } from './rectangle-options';

import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType,} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { BoxSide, getBoxHoverTarget, getCursorForBoxSide, getUpdateBoxPosition  } from '../../../common/points';

export class RectangleDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private _side: BoxSide;
	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		// MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS

		super(DrawingToolType.Rectangle, chart, series, symbolName, RectangleDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);

		this.initialize(baseProps)
		if(baseProps)
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions, this.styleOptions, this.drawingPoints); 
		else
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions); 
	}
	
	normalizeStyleOptions(options : any){
		this.baseProps.styleOptions =normalizeRectangleDrawingToolOptions(options)
	}

	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this.view().applyOptions({ fillColor: 'rgba(100, 100, 100, 0.5)', })
		super.selected();
	}

	onHoverWhenSelected(point: Point) : void {
		this._setCursor(point);
	}

	onDrag(param: MouseEventParams, startPoint: Point, endPoint: Point): void {
		if(param.point){
			this._updatePosition(startPoint, endPoint, this._side);
		}
	}

	private _setCursor(point: Point): void {
		this._side = getBoxHoverTarget(this._chart!, this._series!, this.drawingPoints[0], this.drawingPoints[1], point);
		document.body.style.cursor = getCursorForBoxSide(this._side);
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;
		
		let p1: Point, p2 : Point
		[p1, p2] = getUpdateBoxPosition(startPoint, endPoint, this.drawingPoints[0], this.drawingPoints[1], side, this._chart, this._series, false)
	
		this.finalizeUpdatedPosition(p1, p2)
	}

}
