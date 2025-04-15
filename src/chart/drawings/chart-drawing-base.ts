import { IChartApi, ISeriesApi, SeriesType, MouseEventParams, Point, Time, Coordinate } from 'lightweight-charts';
import { DrawingToolType } from '../toolbar/tools/drawing-tools';
import { IChartDrawing } from './chart-drawing-interface';
import { generateUniqueId } from '../../common/utils/id-generator';
import { PluginBase } from '../../plugins/plugin-base';
import { ensureDefined } from '../../common/utils/assertions';
import { DrawingPoint, MousePointAndTime } from '../../common/points';

import { DrawingEvents, createDrawingEventDetails, eventBus } from '../../common/event-bus';
import { containsPoints, leftRightPoints, pointToDrawingPoints, topBottomPoints } from '../../common/points';
import { ViewBase } from '../drawings/drawing-view-base';

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
    protected _defaultOptions: {};//RectangleDrawingToolOptions;

    protected _isDrawing: boolean;
    protected _isCompleted: boolean;
    protected _isSelected: boolean;
    //protected toolType : DrawingToolType;
    //protected _baseDrawing: PluginBase | undefined;
    //protected _previewDrawing: PluginBase | undefined;
    protected _previewPoints: DrawingPoint[] = []; // points as the drawing is being created
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
        //drawingFinishedCallback?: () => void | undefined
    ) 
    {
        this._chart = chart;
        this._series = series;
        this._defaultOptions = defaultOptions;

        /*
        if(drawingFinishedCallback){
            this._drawingFinishedCallback = drawingFinishedCallback;
        }*/
        if(baseProps){
            this._baseProps = baseProps;
            this._isCompleted = true;
            this.drawingPoints = baseProps.drawingPoints;
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
    set basePropsStyleOptions(options : {}) { this._baseProps.styleOptions = options; }
    get startDate(): Time { return  leftRightPoints(this._baseProps.drawingPoints)?.left || ''; }
    get endDate(): Time { return leftRightPoints(this._baseProps.drawingPoints)?.right || ''; } 
    get startPrice(): number { return topBottomPoints(this._baseProps.drawingPoints)?.bottom || 0; }
    get endPrice(): number { return topBottomPoints(this._baseProps.drawingPoints)?.top || 0; }
    get id(): string { return this._baseProps.id; }
    get type(): DrawingToolType { return this._baseProps.type; }
    get toolType(): DrawingToolType { return this._baseProps.type; }
    get symbolName(): string { return this._baseProps.symbolName; }
    get userId(): string { return this._baseProps.userId; }
    get tags(): string[] { return this._baseProps.tags; }

    get isDrawing(): boolean { return this._isDrawing; }
    get isCompleted(): boolean { return this._isCompleted; }
    get drawingPoints(): DrawingPoint[] { return this._baseProps.drawingPoints; }
    set drawingPoints(points: DrawingPoint[]) { this._baseProps.drawingPoints = points; }

    get text(): string { return this._baseProps.text; }
    set text(text: string) { 
        // TODo SUUUPER hacky fix this
        interface MyObjectWithText {
            text: string;
            // add other fields if needed
        }

        this._baseProps.text = text; 
        let o = this._baseProps.styleOptions as MyObjectWithText
        o.text = text
        //this._baseProps.styleOptions.text = text
        this.drawingView?.setBaseStyleOptions({text})
    }
    get secondsPerBar(): number { return this._baseProps.secondsPerBar; }
    get isSelected(): boolean { return this._isSelected; }
    set isSelected(selected : boolean){ this._isSelected = selected; }
    get isVisible(): boolean { return this._baseProps.isVisible; }
    set isVisible(visible:boolean) { this._baseProps.isVisible = visible; }
    
    get styleOptions(): {} { 
        return this._baseProps.styleOptions; 
    }
    set styleOptions(style: {}) { 
        this.normalizeStyleOptions(this.styleOptions) // normalize the parameter types
        this._baseProps.styleOptions = style 
    }

    abstract select(): void;
    abstract onDrag(param: MousePointAndTime, startPoint: Point, endPoint: Point): void;
    abstract onHoverWhenSelected(point: Point): void;   
    abstract normalizeStyleOptions(options: {}): void;  
	abstract createNewView(chart: IChartApi, series: ISeriesApi<SeriesType>): ViewBase;
    protected abstract finalizeDrawingPoints(): void;

    setNewView(chart: IChartApi, series: ISeriesApi<SeriesType>){
		if(this.drawingView)
			ensureDefined(this._series).detachPrimitive(this.drawingView);

        this._chart = chart
		this._series = series
		this.drawingView = this.createNewView(chart, series)
        ensureDefined(this._series).attachPrimitive(this.drawingView)
	}

    // set the style options to base properties, this is used when loading from config
    setBaseStyleOptionsFromConfig() {    
        this.styleOptions = this.drawingView?.setBaseStyleOptionsFromConfig()!;
    }

    containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
		return containsPoints(chart, series, point, points);
	}
    
    getBasePropsForLoading(){
        return this._baseProps
    }

    deselect(): void {
        this.drawingView?.setBaseStyleOptions(this.styleOptions)
		this.removePreviewDrawing();
        this.stopDrawing();
        this._isSelected = false;
        const details = createDrawingEventDetails(this.id, this.type)
        eventBus.dispatchEvent(new CustomEvent(DrawingEvents.CompletedDrawingUnSelected, details));
        //this.draw(this._chart!, this._series!);
    }

    startDrawing(): void {
        this._isDrawing = true;
        this._previewPoints = [];
    }

    stopDrawing(): void {
        this._isDrawing = false;
		this._previewPoints = [];
    }

    remove() {
		this.stopDrawing();
		this.removePreviewDrawing();
        ensureDefined(this._series).detachPrimitive(this.drawingView as PluginBase);
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

    onClick(param: MousePointAndTime) {
		if (this._isDrawing || !param.point || !param.time || !this._series)  return;

		const price = this._series.coordinateToPrice(param.point.y);

		// if initial drawing is not completed, add the point
		if(!this._isCompleted && price !== null){
			this.addPoint({
				time: param.time,
				price,
			});
		}
	}

	onMouseMove(param: MousePointAndTime) {
		if (!this._chart || this._isDrawing || !this._series || !param.point || !param.time) 
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

    //  store new points temporarily, we will set this back to the drawingPoints when the update is finished
		// TODO we wont need this if we save directly from the class, consider adding save directly from the class
    protected setTmpDrawingPoints(dp1: DrawingPoint, dp2: DrawingPoint): void{
        this.tmpDrawingPoints[0] = dp1
		this.tmpDrawingPoints[1] = dp2
    }
    // Common methods with default implementations
    protected selected(): void {
        this._isSelected = true;
        const details = createDrawingEventDetails(this.id, this.type)
        eventBus.dispatchEvent(new CustomEvent(DrawingEvents.CompletedDrawingSelected, details));
        //this.draw(this._chart!, this._series!);
    }

        
    protected initialize(baseProps?: ChartDrawingBaseProps){
        // we're setting this after super() to make the code cleaner
        this._drawingFinishedCallback = this.finalizeDrawingPoints

        if(baseProps)
            this.normalizeStyleOptions(this.styleOptions);

        this.drawingView = this.createNewView(this._chart!, this._series!)
    }

    protected overrideDrawingPoints(points: DrawingPoint[]): void {
        this._baseProps.drawingPoints = points;
        this.drawingPoints = points;
    }

    protected completeDrawing(): void {
        this._isCompleted = true;
        this._baseProps.drawingPoints = this._previewPoints; // save confirmed points
        this.stopDrawing();
        this.removePreviewDrawing(true); // remove the preview, it will be readded by the manager to all charts
        if(this._drawingFinishedCallback){
            this._drawingFinishedCallback();
        }
        if(this._chart && this._series)
            this.setNewView(this._chart, this._series)
        
        const details = createDrawingEventDetails(this.id, this.type)
        eventBus.dispatchEvent(new CustomEvent(DrawingEvents.NewDrawingCompleted, details));
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
        try{
            if (force || !this._isCompleted) {
                this.stopDrawing();
                console.log('removePreviewDrawing', this.drawingView);
                ensureDefined(this._series).detachPrimitive(this.drawingView as PluginBase);
            }
        }
        catch(err){
            console.error(err)
        }
	}

    // set the style options to base properties, this is used when loading from config
    protected setStyleOptions() {
		const styleOptions = this.drawingView?.getStyleOptions();
		this._baseProps.styleOptions = styleOptions;
    }

    protected view(): ViewBase {
		return this.drawingView as ViewBase;
	}

    protected addPoint(p: DrawingPoint) {
		this._previewPoints.push(p);
		this._setNewDrawing();
	}
 
    // coverts points back to drawing points, updates view, sets tmpDrawingPoints
    protected finalizeUpdatedPosition(p1 : Point, p2 : Point) : void{
		// convert back to drawing coordinates
		let dp1 = pointToDrawingPoints(p1, this._chart!, this._series!)
		let dp2 = pointToDrawingPoints(p2, this._chart!, this._series!)

        // nomralize, so leftest point is first
        if (dp1.time > dp2.time) {
            [dp1, dp2] = [dp2, dp1]; // Swap if dp1 is later than dp2
        }

		this.view().updatePoints([dp1, dp2]) 

		//  store new points temporarily, we will set this back to the drawingPoints when the update is finished
		// TODO we wont need this if we save directly from the class, consider adding save directly from the class
		this.setTmpDrawingPoints(dp1, dp2)
    }

	private _setNewDrawing(){
        if (this._previewPoints.length >= this._totalDrawingPoints) {
			this.completeDrawing();
		}
		else if(this._previewPoints.length === 1){
			this.view().initializeDrawingViews([this._previewPoints[0], this._previewPoints[0]]);
			this.setStyleOptions();

			// we are only drawing this for the preview
			ensureDefined(this._series).attachPrimitive(this.drawingView as PluginBase);
		}
	}
} 