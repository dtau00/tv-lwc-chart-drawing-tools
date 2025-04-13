import { RectangleExtendedView as View} from './rectangle-extended-view';
import { rectangleDrawingToolDefaultOptions as drawingToolDefaultOptions, normalizeRectangleDrawingToolOptions } from '../common/options/rectangle-options';

import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType, Time} from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../../../chart/drawings/chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { BoxSide, DrawingPoint, getBoxHoverTarget, getCursorForBoxSide, getUpdateBoxPosition, pointToDrawingPoints } from '../../../common/points';
import { MAX_TIME } from '../../../common/utils/time';

export class RectangleExtendedDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
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
		super( DrawingToolType.RectangleExtended, chart, series, symbolName, RectangleExtendedDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps, _finalizeDrawingPoints);
		
		this.initialize(baseProps);
		if(baseProps)
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions, this.styleOptions, this.drawingPoints); 
		else
			this.drawingView = new View(chart, series, this.toolType, drawingToolDefaultOptions); 
	}

	normalizeStyleOptions(options : any){
		this.basePropsStyleOptions = normalizeRectangleDrawingToolOptions(options)
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

		//  store new points temporarily, we will set this back to the drawingPoints when the update is finished
		// TODO we wont need this if we save directly from the class, consider adding save directly from the class
		this.tmpDrawingPoints[0] = dp1
		this.tmpDrawingPoints[1] = dp2

		//this.finalizeUpdatedPosition(p1, p2)
	}	
}
