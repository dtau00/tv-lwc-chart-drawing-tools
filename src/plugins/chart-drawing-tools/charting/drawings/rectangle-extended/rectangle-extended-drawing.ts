import {
	Coordinate,
	IChartApi,
	ISeriesApi,
    MouseEventParams,
    Point,
    SeriesType,
	Time,
} from 'lightweight-charts';
import { RectangleExtendedView } from './rectangle-extended-view';
import { rectangleDrawingToolDefaultOptions as drawingToolDefaultOptions } from '../rectangle/rectangle-options';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { BoxSide, getBoxHoverTarget, getCursorForBoxSide, resizeBoxByHandle, updateBoxPosition } from '../../../common/points';
import { DrawingPoint } from '../../../common/common';

export class RectangleExtendedDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private _toolType: DrawingToolType; // = DrawingToolType.Rectangle; // set the tool type for the class
	private _side: BoxSide;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {

		const _finalizeDrawingPoints =()=>{
			let p1 = this.drawingPoints[0];
			let p2 = this.drawingPoints[1];
			const end = this._chart?.timeScale().getVisibleRange()?.to;
			if(end){
				if(p1.time > p2.time)
					p1.time = end as Time; //(Number(p1.time) * 2) as Time;
				else
					p2.time = end as Time; //(Number(p2.time) * 2) as Time;
				this.overrideDrawingPoints([p1, p2]);
			}
		}

		// MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS
		const toolType = DrawingToolType.RectangleExtended

		super( toolType, chart, series, symbolName, RectangleExtendedDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
		const initializeFromStorage = baseProps ? true : false;
		this._toolType = toolType
		this.drawingView = new RectangleExtendedView(chart, series, this._toolType, drawingToolDefaultOptions,  baseProps?.styleOptions, baseProps || this.baseProps, initializeFromStorage); 
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
		if(!param.point)
			return;
		this._updatePosition(startPoint, endPoint, this._side);
	}

	private _setCursor(point: Point): void {
		this._side = getBoxHoverTarget(this._chart!, this._series!, this.drawingPoints[0], this.drawingPoints[1], point);
		document.body.style.cursor = getCursorForBoxSide(this._side);
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;
		
		let dp1 : DrawingPoint, dp2 : DrawingPoint
		[dp1, dp2] = updateBoxPosition(startPoint, endPoint, this.drawingPoints[0], this.drawingPoints[1], side, this._chart, this._series, true)
		
		this.view().updatePoints([dp1, dp2]) 

		//  store new points temporarily, we will set this back to the drawingPoints when the update is finished
		// TODO we wont need this if we save directly from the class, consider adding save directly from the class
		this.tmpDrawingPoints[0] = dp1
		this.tmpDrawingPoints[1] = dp2
	}
	
}
