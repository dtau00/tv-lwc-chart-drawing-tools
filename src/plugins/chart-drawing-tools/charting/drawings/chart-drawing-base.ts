import { IChartApi, ISeriesApi, SeriesType, MouseEventParams, Point, Time, Coordinate } from 'lightweight-charts';
import { DrawingToolType } from '../toolbar/tools/drawing-tools';
import { IChartDrawing } from './chart-drawing-interface';
import { generateUniqueId } from '../../../../helpers/id-generator';
import { PluginBase } from '../../../plugin-base';
import { ensureDefined } from '../../../../helpers/assertions';
import { eventBus, DrawingPoint, toolKeyName } from '../../common/common';

import { ChartEvents } from '../../enums/events';
import { BoxSide, containsPoints, leftRightPoints, topBottomPoints } from '../../common/points';
import { ConfigStorage } from '../../data/data';
import { ViewBase } from './drawing-view-base';

 // base properties that are common to all drawings, to make it cleaner to serialize and save/load
export interface ChartDrawingBaseProps{
    id: string;
    userId: string;
    tags: string[];
    symbolName: string;
    type: DrawingToolType;
    styleOptions: {}; 
    drawingPoints: DrawingPoint[];
    text: string;
    secondsPerBar: number;
    isVisible: boolean;
}

export abstract class ChartDrawingBase implements IChartDrawing {
    private _drawingFinishedCallback: () => void | undefined;
    protected _baseProps: ChartDrawingBaseProps;
    protected _chart: IChartApi | undefined;
    protected _series: ISeriesApi<SeriesType> | undefined;
	protected _options: {};//RectangleDrawingToolOptions;
    protected _defaultOptions: {};//RectangleDrawingToolOptions;

    protected _isDrawing: boolean;
    protected _isCompleted: boolean;
    protected _isSelected: boolean;

    //protected _baseDrawing: PluginBase | undefined;
    //protected _previewDrawing: PluginBase | undefined;
    protected _points: DrawingPoint[] = []; // points as the drawing is being created
    protected _totalDrawingPoints: number; // setting this allows for some default handling of drawing points for 1 and 2, most common cases
    
    public tmpDrawingPoints: DrawingPoint[] = [];
    public drawingView: ViewBase | undefined;

    constructor(
        type: DrawingToolType,
        chart: IChartApi,
        series: ISeriesApi<SeriesType>,
        symbolName: string,
        totalDrawingPoints: number,
        defaultOptions: {},
        baseProps?: ChartDrawingBaseProps,
        drawingFinishedCallback?: () => void | undefined
    ) 
    {
        this._chart = chart;
        this._series = series;
        this._defaultOptions = defaultOptions;

        if(drawingFinishedCallback){
            this._drawingFinishedCallback = drawingFinishedCallback;
        }
        if(baseProps){
            this._baseProps = baseProps;
            this._isCompleted = true;
            this._points  = baseProps.drawingPoints;
            this.drawingPoints = this._points;
        }
        else{
            this._baseProps = {
                id: generateUniqueId('drawing_'),
                symbolName: symbolName,
                type: type,
                styleOptions: {},
                drawingPoints: [],
                text: '',
                secondsPerBar: 0,
                isVisible: true,
                userId: '',
                tags: [],
            }
        }
        this._chart = chart;
        this._series = series;
        this._totalDrawingPoints = totalDrawingPoints;
    }

    // IChartDrawing implementation
    get baseProps(): ChartDrawingBaseProps { return this._baseProps; }
    get startDate(): Time { return  leftRightPoints(this._baseProps.drawingPoints)?.left || ''; }
    get endDate(): Time { return leftRightPoints(this._baseProps.drawingPoints)?.right || ''; } 
    get startPrice(): number { return topBottomPoints(this._baseProps.drawingPoints)?.bottom || 0; }
    get endPrice(): number { return topBottomPoints(this._baseProps.drawingPoints)?.top || 0; }
    get id(): string { return this._baseProps.id; }
    get type(): DrawingToolType { return this._baseProps.type; }
    get symbolName(): string { return this._baseProps.symbolName; }
    get userId(): string { return this._baseProps.userId; }
    get tags(): string[] { return this._baseProps.tags; }
    get styleOptions(): {} { return this._baseProps.styleOptions; }
    get isSelected(): boolean { return this._isSelected; }
    get isVisible(): boolean { return this._baseProps.isVisible; }
    get isDrawing(): boolean { return this._isDrawing; }
    get isCompleted(): boolean { return this._isCompleted; }
    //get primative(): PluginBase | undefined{ return this._baseDrawing; }
   // get preview(): PluginBase | undefined{ return this._previewDrawing; }
    get drawingPoints(): DrawingPoint[] { return this._baseProps.drawingPoints; }
    set drawingPoints(points: DrawingPoint[]) { this._baseProps.drawingPoints = points; }

    get text(): string { return this._baseProps.text; }
    get secondsPerBar(): number { return this._baseProps.secondsPerBar; }

    set styleOptions(style: {}) { this._baseProps.styleOptions = style }
    set isSelected(selected : boolean){ this._isSelected = selected; }
    set isVisible(visible:boolean) { this._baseProps.isVisible = visible; }
    // Abstract methods that must be implemented by derived classes
    //abstract draw(chart: IChartApi, series: ISeriesApi<SeriesType>): void;
    //abstract getBounds(): { top: number; bottom: number; left: number; right: number };
    //abstract updatePosition(startPoint: Point, endPoint: Point, side: BoxSide): void;
    abstract select(): void;
    abstract onDrag(param: MouseEventParams, startPoint: Point, endPoint: Point): void;
    abstract onHoverWhenSelected(point: Point): void;   

    // set the style options to base properties, this is used when loading from config
    public setBaseStyleOptionsFromConfig() {    
        this.drawingView?.setBaseStyleOptionsFromConfig();
    }

    containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
		return containsPoints(chart, series, point, points);
	}
    
    // Common methods with default implementations
    protected selected(): void {
        this._isSelected = true;
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.CompletedDrawingSelected, { detail: this.id }));
        //this.draw(this._chart!, this._series!);
    }

    deselect(): void {
        this.drawingView?.setBaseStyleOptions()
		this.removePreviewDrawing();
        this._isSelected = false;
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.CompletedDrawingUnSelected, { detail: this.id }));
        //this.draw(this._chart!, this._series!);
    }

    startDrawing(): void {
        this._isDrawing = true;
        this._points = [];
    }

    stopDrawing(): void {
        this._isDrawing = false;
		this._points = [];
    }

    remove() {
		this.stopDrawing();
		this.removePreviewDrawing();
		//this.removeChartDrawing();
		this._chart = undefined;
		this._series = undefined;
	}

    // TODO we can get rid of this by saving directly from the class, rather than from Manager
    setTmpToNewDrawingPoints(): void {
        if(this.tmpDrawingPoints.length === 0)
            return;

		this.drawingPoints = this.tmpDrawingPoints;
		this.tmpDrawingPoints = [];
	}

    onClick(param: MouseEventParams) {
		if (this._isDrawing || !param.point || !param.time || !this._series) 
			return;

		const price = this._series.coordinateToPrice(param.point.y);

		// if initial drawing is not completed, add the point
		if(!this._isCompleted && price !== null){
			this.addPoint({
				time: param.time,
				price,
			});
		}
	}

	onMouseMove(param: MouseEventParams) {
        //console.log('onMouseMove', param.point);
		if (!this._chart || this._isDrawing || !this._series || !param.point) 
			return;

		const price = this._series.coordinateToPrice(param.point.y);
		if (price === null || param.time === undefined) 
			return;

		// if initial drawing is not completed, update the initial point
		if(!this._isCompleted){	
			this.view().updateInitialPoint({
				time: param.time,
				price,
			}, param);
		}
	}

    protected overrideDrawingPoints(points: DrawingPoint[]): void {
        this._baseProps.drawingPoints = points;
        this.drawingPoints = points;
    }

    protected completeDrawing(): void {
        this._isCompleted = true;
        this._baseProps.drawingPoints = this._points; // save confirmed points
        this.stopDrawing();
        this.removePreviewDrawing(true); // remove the preview, it will be readded by the manager to all charts
        if(this._drawingFinishedCallback){
            this._drawingFinishedCallback();
        }
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.NewDrawingCompleted, { detail: {id: this.id, type: this.type } }));
    }

    protected setChart(chart: IChartApi): void {
        this._chart = chart;
    }

    protected setSeries(series: ISeriesApi<SeriesType>): void {
        this._series = series;
    }

    protected validatePoints(points: DrawingPoint[]): boolean {
        return points.length > 0 && points.every(point => 
            typeof point.time === 'number' && 
            typeof point.price === 'number'
        );
    }

    /* NOTE the preview behaves differently than the chartDrawing primative.  The chartDrawing is managed by the
	// chart manager, and the drawing is applied onto the chartContainer.  
	// For the preview, the primative is attached by this object, directly onto the chart it's initialized with
	// This is obviously weird, and the las piece of coupling of the chart and series objects.  This code follows
	// the example provided by Trading View, so we'll have to really consider how and if we should decouple it
	// for now, funcitonally it shouldnt have a problem, since there can only be one active chart, and therefore preview
	// at a time.*/
    protected removePreviewDrawing(force : boolean = false) {
		if (force || !this._isCompleted) {
			console.log('removePreviewDrawing', this.drawingView);
			ensureDefined(this._series).detachPrimitive(this.drawingView as PluginBase);
		}
	}

    // set the style options to base properties, this is used when loading from config
    protected setStyleOptions() {
		const styleOptions = this.drawingView?.getStyleOptions();
		this.baseProps.styleOptions = styleOptions;
    }

    protected view(): ViewBase {
		return this.drawingView as ViewBase;
	}

    protected addPoint(p: DrawingPoint) {
		this._points.push(p);
        //this._points = this._reorderPoints(this._points);
		this._setNewDrawing();
	}

	private _setNewDrawing(){
        if (this._points.length >= this._totalDrawingPoints) {
			this.completeDrawing();
		}
		else if(this._points.length === 1){
			this.view().initializeDrawingViews([this._points[0], this._points[0]]);
			this.setStyleOptions();

			// we are only drawing this for the preview
			ensureDefined(this._series).attachPrimitive(this.drawingView as PluginBase);
		}
	}

    /*
    // reorder 2 points from bottom left to top right
    private _reorderPoints(points: DrawingPoint[]): DrawingPoint[] {
        if(points.length !== 2)
            return points;

        const lowPrice = Math.min(...points.map(p => p.price));
        const highPrice = Math.max(...points.map(p => p.price));

        const lowTime = Math.min(...points.map(p => Number(p.time)));
        const highTime = Math.max(...points.map(p => Number(p.time)));

        const p1 : DrawingPoint = {time: lowTime as Time, price: lowPrice};
        const p2 : DrawingPoint = {time: highTime, price: highPrice};

        return [p1, p2];
    }*/
} 