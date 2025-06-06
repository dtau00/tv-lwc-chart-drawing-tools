import { RectangleExtendedView as View} from './rectangle-extended-view';
import { rectangleFillDrawingToolDefaultOptions as drawingToolDefaultOptions, normalizeRectangleDrawingToolOptions } from '../common/options/rectangle-options';

import { IChartApi, ISeriesApi, Point, SeriesType, Time} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../../../chart/drawings/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { BoxSide, containsPoints, DrawingPoint, getBoxHoverTarget, getCursorForBoxSide, getUpdateBoxPosition, MousePointAndTime, pointToDrawingPoints } from '../../../common/points';
import { MAX_TIME } from '../../../common/utils/time';
import { ViewBase } from '../drawing-view-base';

export class RectangleExtendedDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private static readonly TOOL_TYPE = DrawingToolType.RectangleExtended // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS

	private _side!: BoxSide;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
		super( RectangleExtendedDrawing.TOOL_TYPE, chart, series, symbolName, RectangleExtendedDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);
		
		this.initialize(baseProps);
	}

	createNewView(chart: IChartApi, series: ISeriesApi<SeriesType>): ViewBase{
        return new View(chart, series, this.toolType, this._defaultOptions, this.id, this.styleOptions, this.drawingPoints); 
    }
	
	normalizeStyleOptions(options : any){
		this.basePropsStyleOptions = normalizeRectangleDrawingToolOptions(options)
	}
	
	containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
		return containsPoints(chart, series, point, points);
	}
	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this.view().applyOptions({ 
			fillColor: 'rgba(100, 100, 100, 0.5)', 
			//strokeColor: 'rgb(218, 250, 9)',
			//strokeColorOpacity: 1
		})
		super.selected();
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
		let p1 = this.drawingPoints[0];
		let p2 = this.drawingPoints[1];
		//const end = this._chart?.timeScale().getVisibleRange()?.to;
		const end = MAX_TIME
		if(end){
			if(p1.time > p2.time)
				p1.time = end as Time; 
			else
				p2.time = end as Time; 
			this.overrideDrawingPoints([p1, p2]);
		}
	}

	private _setCursor(point: Point): void {
		this._side = getBoxHoverTarget(this._chart!, this._series!, this.drawingPoints[0], this.drawingPoints[1], point, undefined, true);
		document.body.style.cursor = getCursorForBoxSide(this._side);
	}

	// update the position of the drawing, based on how its being resized
	private _updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) return;
		
		let p1: Point, p2 : Point
		[p1, p2] = getUpdateBoxPosition(startPoint, endPoint, this.drawingPoints[0], this.drawingPoints[1], side, this._chart, this._series, true)
	
		let dp1 : DrawingPoint, dp2 : DrawingPoint

		if(Number(this.drawingPoints[0].time) > Number(this.drawingPoints[1].time)){
			dp1 = pointToDrawingPoints(p2, this._chart!, this._series!)
			dp2 = {
				time: this.drawingPoints[0].time,
				price: this._series.coordinateToPrice(p1.y)!
			}
		}
		else{
			dp1 = pointToDrawingPoints(p1, this._chart!, this._series!)
			dp2 = {
				time: this.drawingPoints[1].time,
				price: this._series.coordinateToPrice(p2.y)!
			}
		}

		this.view().updatePoints([dp1, dp2]) 

		this.setTmpDrawingPoints(dp1, dp2)
	}	
}
