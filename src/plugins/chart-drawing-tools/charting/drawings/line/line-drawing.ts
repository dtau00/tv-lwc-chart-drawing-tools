import {
	Coordinate,
	IChartApi,
	ISeriesApi,
    Point,
    SeriesType,
} from 'lightweight-charts';

import { Line as View } from './line-view';
import { lineDrawingToolDefaultOptions as drawingToolDefaultOptions } from './line-options';
import { ChartDrawingBase, ChartDrawingBaseProps } from '../chart-drawing-base';
import { DrawingToolType } from '../../toolbar/tools/drawing-tools';
import { BoxSide, resizeBoxByHandle } from '../../../common/points';

export class LineDrawing extends ChartDrawingBase{
	private static readonly TOTAL_DRAWING_POINTS = 2; // Set the drawing points for this type of drawing.  A box will have 2, a line ray will have 1, etc...
	private _toolType: DrawingToolType; // = DrawingToolType.Rectangle; // set the tool type for the class


	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		baseProps?: ChartDrawingBaseProps,
	) {
        // MAKE SURE TO UPDATE THIS WHEN CREATING NEW DRAWING TOOLS
		const toolType = DrawingToolType.Line;

		super( toolType, chart, series, symbolName, LineDrawing.TOTAL_DRAWING_POINTS, drawingToolDefaultOptions, baseProps);
		this._toolType = toolType
		this.drawingView = new View(chart, series, this._toolType, drawingToolDefaultOptions,  baseProps?.styleOptions, baseProps || this.baseProps, baseProps ? true : false ); 
	}

	// TODO dont make this hard coded
	// set the style when drawing is selected
	select(): void {
		this.view().applyOptions({ lineColor: 'rgba(100, 100, 100, 0.5)', })
		super.selected();
	}

	// update the position of the drawing, based on how its being resized
	updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void {
		if (!this._chart || this._isDrawing || !this._series || this.drawingPoints.length < 2) 
			return;

		// Note we can't directly update the drawingPoints or the time value will be off , so always have to calculate from the initial points
		let xOffset = endPoint.x - startPoint.x;
		let yOffset = endPoint.y - startPoint.y;

		// So we dont want to update the drawingPoints until the update is finished, we will use tmpDrawingPoints to store the new points
		const drawingPoint1 = this.drawingPoints[0];
		const drawingPoint2 = this.drawingPoints[1];


		let pricePoint1 = this._series.priceToCoordinate(drawingPoint1.price);
		let pricePoint2 = this._series.priceToCoordinate(drawingPoint2.price);
		let timePoint1 = this._chart.timeScale().timeToCoordinate(drawingPoint1.time) 
		let timePoint2 = this._chart.timeScale().timeToCoordinate(drawingPoint2.time)

		let p1 = {x: timePoint1, y: pricePoint1};
		let p2 = {x: timePoint2, y: pricePoint2};

		if(p1.x !== null && p2.x !== null && p1.y !== null && p2.y !== null){

			// assume timepoint1 is always the start of the box
			if(p1.x > p2.x){
				const tmp = p1;
				p1 = p2;
				p2 = tmp;
			}

			// adjust coordinates based on the side
			if(side === 'inside'){
				if(p1.x !== null && p2.x !== null && p1.y !== null && p2.y !== null){
					p1.x = (p1.x + xOffset) as Coordinate;
					p2.x = (p2.x + xOffset) as Coordinate;
					p1.y = (p1.y + yOffset) as Coordinate;
					p2.y = (p2.y + yOffset) as Coordinate;
				}
			}
			else if(p1.x !== null && p2.x !== null && p1.y !== null && p2.y !== null){
				const point1 = {x: p1.x, y: p1.y};		
				const point2 = {x: p2.x, y: p2.y};
				const newPoints = resizeBoxByHandle(point1, point2, side, endPoint);
				p1 = newPoints[0];
				p2 = newPoints[1];
			}

            // convert back to drawing coordinates
            if(p1.x !== null && p2.x !== null && p1.y !== null && p2.y !== null){
                const newDrawingPoint1 = {time: this._chart.timeScale().coordinateToTime(p1.x)!, price: this._series.coordinateToPrice(p1.y)!};
                const newDrawingPoint2 = {time: this._chart.timeScale().coordinateToTime(p2.x)!, price: this._series.coordinateToPrice(p2.y)!};

                // update the drawing
                this.view().updatePoints([newDrawingPoint1, newDrawingPoint2]) 

                //  store new points temporarily, we will set this back to the drawingPoints when the update is finished
                // TODO we wont need this if we save directly from the class, consider adding save directly from the class
                this.tmpDrawingPoints[0] = newDrawingPoint1
                this.tmpDrawingPoints[1] =newDrawingPoint2
            }
		}
	}
}
