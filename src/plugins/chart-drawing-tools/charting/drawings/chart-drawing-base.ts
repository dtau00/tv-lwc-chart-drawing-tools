import { IChartApi, ISeriesApi, SeriesType, MouseEventParams, Point, Time, Coordinate } from 'lightweight-charts';
import { DrawingToolType, DrawingStyle } from '../toolbar/tools/drawing-tools';
import { IChartDrawing } from './chart-drawing-interface';
import { generateUniqueId } from '../../../../helpers/id-generator';
import { PluginBase } from '../../../plugin-base';
import { ensureDefined } from '../../../../helpers/assertions';
import { eventBus, DrawingPoint, toolKeyName, mergeOpacityIntoRgba } from '../../common/common';
import { ChartEvents } from '../../enums/events';
import { containsPoints, leftRightPoints, topBottomPoints } from '../../common/points';
import { ConfigStorage } from '../../data/data';

    // base properties that are common to all drawings, to make it cleaner to serialize and save/load
export interface ChartDrawingBaseProps{
    id: string;
    userId: string;
    tags: string[];
    symbolName: string;
    type: DrawingToolType;
    styleOptions: {}; //DrawingStyle;
    drawingPoints: DrawingPoint[];
    text: string;
    leftOffsetSeconds: number;
    rightOffsetSeconds: number;
    secondsPerBar: number;
    isVisible: boolean;
}

export abstract class ChartDrawing implements IChartDrawing {
    protected _baseProps: ChartDrawingBaseProps;
    protected _chart: IChartApi | undefined;
    protected _series: ISeriesApi<SeriesType> | undefined;

    protected _isDrawing: boolean;
    protected _isCompleted: boolean;
    protected _isSelected: boolean;

    protected _baseDrawing: PluginBase | undefined;
    //protected _previewDrawing: PluginBase | undefined;
    protected _points: DrawingPoint[] = []; // points as the drawing is being created
    protected _totalDrawingPoints: number; // setting this allows for some default handling of drawing points for 1 and 2, most common cases

    public tmpDrawingPoints: DrawingPoint[] = [];

    constructor(
        type: DrawingToolType,
        chart: IChartApi,
        series: ISeriesApi<SeriesType>,
        symbolName: string,
        totalDrawingPoints: number,
        baseProps?: ChartDrawingBaseProps,
    ) 
    {
        if(baseProps){
            this._baseProps = baseProps;
            this._isCompleted = true;
        }
        else{
            this._baseProps = {
                id: generateUniqueId('drawing_'),
                symbolName: symbolName,
                type: type,
                styleOptions: {},
                drawingPoints: [],
                text: '',
                leftOffsetSeconds: 0,
                rightOffsetSeconds: 0,
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
    get primative(): PluginBase | undefined{ return this._baseDrawing; }
   // get preview(): PluginBase | undefined{ return this._previewDrawing; }
    get drawingPoints(): DrawingPoint[] { return this._baseProps.drawingPoints; }
    set drawingPoints(points: DrawingPoint[]) { this._baseProps.drawingPoints = points; }
    get text(): string { return this._baseProps.text; }
    get leftOffsetSeconds(): number { return this._baseProps.leftOffsetSeconds; }
    get rightOffsetSeconds(): number { return this._baseProps.rightOffsetSeconds; }
    get secondsPerBar(): number { return this._baseProps.secondsPerBar; }

    set styleOptions(style: {}) { this._baseProps.styleOptions = style }
    set isSelected(selected : boolean){ this._isSelected = selected; }
    set isVisible(visible:boolean) { this._baseProps.isVisible = visible; }
    // Abstract methods that must be implemented by derived classes
    //abstract draw(chart: IChartApi, series: ISeriesApi<SeriesType>): void;
    //abstract getBounds(): { top: number; bottom: number; left: number; right: number };
    abstract onClick(event: MouseEventParams): void;
    abstract onMouseMove(event: MouseEventParams): void;
    abstract updatePosition(startPoint: Point, endPoint: Point): void;

    containsPoint(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[]): boolean {
		return containsPoints(chart, series, point, points);
	}
    
    // Common methods with default implementations
    select(): void {
        this._isSelected = true;
        //this.draw(this._chart!, this._series!);
    }

    deselect(): void {
        this._isSelected = false;
        //this.draw(this._chart!, this._series!);
    }

    updateStyle(style: Partial<DrawingStyle>): void {
        this._baseProps.styleOptions = { ...this._baseProps.styleOptions, ...style };
        if (this._baseProps.isVisible) {
            //this.draw(this._chart!, this._series!);
        }
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

    setTmpToNewDrawingPoints(): void {
		this.drawingPoints = this.tmpDrawingPoints;
		this.tmpDrawingPoints = [];
	}

/*
    protected addPoint(point: DrawingPoint): void {
        this._points.push(point);
        if(this._totalDrawingPoints === 1){
            throw new Error(`need to implement default handling for 1 point drawing`);
        }   
        else if(this._totalDrawingPoints === 2){
            if (this._points.length === 1) {
                this._createPreviewDrawing(this._points[0]);
            }
            else if (this._points.length >= this._totalDrawingPoints) {
                this._createChartDrawing(this._points[0], this._points[1]);
            }
        }
        else{
            // no default handling for more than 2 points, you'll need to override this
            throw new Error(`totalDrawingPoints not hanlded: ${this._totalDrawingPoints}`);
        }
    }*/

    protected completeDrawing(): void {
        this._isCompleted = true;
        this._baseProps.drawingPoints = this._points; // save confirmed points
        this.stopDrawing();
        this.removePreviewDrawing();
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.NewDrawingCompleted, { detail: this._baseProps.id }));
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
    protected removePreviewDrawing() {
		if (this._baseDrawing && !this._isCompleted) {
			ensureDefined(this._series).detachPrimitive(this._baseDrawing);
			//this._baseDrawing = undefined;
		}
	}

    /*
	protected removeChartDrawing() {
		if (this._chartDrawing) {
			ensureDefined(this._series).detachPrimitive(this._chartDrawing);
			this._chartDrawing = undefined;
		}
	}*/

    // loads override settings from storage.  Only overrides, does not include default settings
    protected getOverrideOptions<T>(toolType: DrawingToolType, styleOptions: Partial<T>): Partial<T> {
        const keyName = toolKeyName(toolType);
        const isEmpty = (obj: object) => Object.keys(obj).length === 0;
        const overrides = isEmpty(styleOptions) ? ConfigStorage.loadConfig(keyName, {}) as Partial<T> : styleOptions;
        return overrides;
    }

    // internal system often uses rgba to apply opacity, rather than the opacity property, so heres
    // a helper to merge the two color and opacity values into rgba, or returns default
    protected getRgbaOverrideColorFromOptions<T>(toolType: DrawingToolType, colorPropertyName: string, opacityPropertyName: string, defaultOptions: Partial<T>, overrideOptions?: Partial<T>){
        let overrides = overrideOptions ?? this.getOverrideOptions(toolType, this._baseProps.styleOptions)
        if((overrides as any)[colorPropertyName] && (overrides as any)[opacityPropertyName])
			overrides[colorPropertyName] = mergeOpacityIntoRgba((overrides as any)[colorPropertyName], (overrides as any)[opacityPropertyName]);
		return overrides[colorPropertyName] || defaultOptions[colorPropertyName];
    }
} 