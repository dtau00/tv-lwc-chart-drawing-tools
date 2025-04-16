import { RectangleLine as View } from './rectangle-line-view';
import { rectangleLineDrawingToolDefaultOptions as drawingToolDefaultOptions, normalizeRectangleDrawingToolOptions } from '../common/options/rectangle-options';

import { IChartApi, ISeriesApi, Point, SeriesType,} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../../../chart/drawings/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { BoxSide, DrawingPoint, getBoxHoverTarget, getCursorForBoxSide, getUpdateBoxPosition, MousePointAndTime  } from '../../../common/points';
import { ViewBase } from '../drawing-view-base';

export class RectangleLineDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private static readonly TOOL_TYPE = DrawingToolType.RectangleLine // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS
	private _side: BoxSide;
	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		super(RectangleLineDrawing.TOOL_TYPE, chart, series, symbolName, RectangleLineDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);
		
		this.initialize(baseProps)
	}
	
	createNewView(chart: IChartApi, series: ISeriesApi<SeriesType>): ViewBase{
        return new View(chart, series, this.toolType, this._defaultOptions, this.id, this.styleOptions, this.drawingPoints); 
    }
		
	normalizeStyleOptions(options : any){
		this.basePropsStyleOptions =normalizeRectangleDrawingToolOptions(options)
	}

	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this.view().applyOptions({ 
			strokeColor: 'rgba(100, 100, 100, 0.5)', 
			//strokeColor: 'rgb(218, 250, 9)',
			//strokeColorOpacity: 1
		})
		super.selected();
	}

	containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
		const side = getBoxHoverTarget(chart!, series!, points[0], points[1], point);
		return (side && side !== 'inside') ? true : false;
	}
	
	onHoverWhenSelected(point: Point) : void {
		this._setCursor(point);
	}

	setToMoving(): void{
		this._side = 'inside';
		document.body.style.cursor = 'move';
	}

	onDrag(param: MousePointAndTime, startPoint: Point, endPoint: Point): void {
		if(param.point){
			this._updatePosition(startPoint, endPoint, this._side);
		}
	}

	protected finalizeDrawingPoints =()=>{
		// nothing to do
	}
	
	private _setCursor(point: Point): void {
		this._side = getBoxHoverTarget(this._chart!, this._series!, this.drawingPoints[0], this.drawingPoints[1], point, undefined, true);
		document.body.style.cursor = getCursorForBoxSide(this._side);
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2)  return;
		
		let p1: Point, p2 : Point
		[p1, p2] = getUpdateBoxPosition(startPoint, endPoint, this.drawingPoints[0], this.drawingPoints[1], side, this._chart, this._series, false)
	
		this.finalizeUpdatedPosition(p1, p2)
	}

}
