import { CandlestickData, ISeriesApi, SeriesType, Time } from "lightweight-charts";
import { IChartApi } from "lightweight-charts";
import { ensureDefined } from "../../common/utils/assertions.ts";
import { ChartDrawingsManager } from "../chart-drawings-manager.ts";
import { ChartDrawingBase } from "../drawings/chart-drawing-base.ts";
import { createChartMouseHandlers, initializeListeners, removeListeners } from "./chart-mouse-handlers.ts";
import { ViewBase } from "../drawings/drawing-view-base.ts";
import { autoScrollToPosition } from "../../common/chart.ts";
import { generateDummyBars, initWhitespaceSeries } from "../../common/utils/whitespace-series.ts";

/** 
 * container forIChartApi and ISeriesApi, extends to include some additional properties
* The main purpose of this is to track the drawing primatives on a chart, manage the chart whitespace
* and to manage the event handlers (we are not using the provided ones by IChartApi since they are limited))
* since a ChartDrawing can be applied to multiple charts, but a primate (the actual drawing object on the chart) can only be applied to one chart.
 */
export class ChartContainer {
    private _chartManager: ChartDrawingsManager;
    private _chartDivContainer: HTMLDivElement;
    private _chartId: string;
    private _symbolName: string;
    private _secondsPerBar: number;
    private _tags: string[] = [];
    private _chart: IChartApi;
    private _series: ISeriesApi<SeriesType>;
    private _primatives : Map<string, ViewBase> = new Map();  
    private _handlers: ReturnType<typeof createChartMouseHandlers>;
    private _whiteSpaceTotal: number = 100;
    private _whiteSpaceSeries: ISeriesApi<SeriesType>;
    private _dataInitialized = false;
    private _autoScrollBars : number = 5; // todo make this configurable

    constructor(
        chartManager: ChartDrawingsManager,
        chartDivContainer: HTMLDivElement,
        chart: IChartApi,
        series: ISeriesApi<SeriesType>,
        chartId: string,
        symbolName: string,
        secondsPerBar: number,
        tags?: string[],
    ){
        this._chartManager = chartManager;
        this._chartDivContainer = chartDivContainer;
        this._chartId = chartId;
        this._symbolName = symbolName;
        this._secondsPerBar = secondsPerBar;
        this._tags = tags || [];
        this._chart = chart;
        this._series = series;

        this._handlers = createChartMouseHandlers(this);
        initializeListeners(this._handlers, this);
    }

    public get chart(): IChartApi { return this._chart;}
    public get series(): ISeriesApi<SeriesType> { return this._series;} 
    public get symbolName(): string { return this._symbolName;}
    public get secondsPerBar(): number { return this._secondsPerBar;}
    public get chartId(): string { return this._chartId;}
    public get tags(): string[] { return this._tags;}
    public get chartDivContainer(): HTMLDivElement { return this._chartDivContainer;}
    public get chartManager(): ChartDrawingsManager { return this._chartManager;  }

    private get lastWhitespaceDate(): Time {return this._whiteSpaceSeries.data()?.at(-1)!.time }
    private get lastSeriesDate(): Time { return this._series.data()?.at(-1)!.time }

    /**
     * Must call before destroying the object.  removes listeners.
     */
    dispose() : void{
        removeListeners(this._handlers, this);
        this._chart.remove();
    }

    /**
     * Sets initial data for the chart, and initializes whitespace data to expand the drawable area for the chart.
     * 
     * @param data CandleStickData[]:  initial CandleStick data
     * @returns boolean: success
     */
	setData(data: CandlestickData[]) : boolean{
		if(!data.length) return false

		this._dataInitialized = true

        // initialize data and whitespace
        this._series.setData(data)
		this._whiteSpaceSeries = initWhitespaceSeries(data, this._secondsPerBar, this._whiteSpaceTotal, this._chart)

        autoScrollToPosition(true, this._autoScrollBars, this._whiteSpaceTotal, this._chart, this._series )

        return true;
	}

	/**
     * update current bar for series and expands whitespace
     * 
     * @param bar 
     */
	updateData(bar : CandlestickData): void{
		if(!this._dataInitialized) throw new Error('Cant updateData before initializing base data')
        if(!this.lastWhitespaceDate) return;

		this._series.update(bar) // update series with new data.  track number of new bars

        // if we have new bars, generate same amount of dummy bars to keep the whitespacing
		if(bar.time > this.lastSeriesDate){ 
            this._updateSyncSeriesAndDummySeries(bar);
			autoScrollToPosition(false, this._autoScrollBars, this._whiteSpaceTotal, this._chart, this._series )
		}
	}

    /**
     * Adds or redraws the chart drawing primative
     * 
     * @param chartDrawing 
     */
    setChartDrawingPrimative(chartDrawing: ChartDrawingBase): void{
        this.removePrimative(chartDrawing.id)

        const primative = chartDrawing.createNewView(this._chart, this._series)
        this._primatives.set(primative.drawingId, primative)
        ensureDefined(this._series).attachPrimitive(primative); // add to series, draws on the chart
    }

    /**
     * Adds or redraws the list of chart drawing primatives
     * 
     * @param chartDrawings
     */
    setChartDrawingPrimatives(chartDrawings: ChartDrawingBase[]): void{
        for(const drawing of chartDrawings)
            this.setChartDrawingPrimative(drawing)
    }

    /**
     * Switches all the chart drawing primatives to this chart, allowing drawing to be manipulated
     * @param chartDrawings 
     */
    
    setAsActiveChart(chartDrawings: ChartDrawingBase[]): void{
        this.clearPrimatives() 

         // change the view of the chart drawing to this chart.  This goes through a different rendering pipeline 
        for(const drawing of chartDrawings){
            drawing.setNewView(this._chart, this._series)
        }
    }

    /**
     * Clears and redraws list of chart drawing primatives.  Drawings not in the list will not be redrawn.
     * 
     * @param chartDrawings 
     */
    reDrawChartDrawings(chartDrawings: ChartDrawingBase[]): void{
        this.clearPrimatives()
        this.setChartDrawingPrimatives(chartDrawings)
    }

    /**
     * Clears all drawing primatives from the chart
     */   
    clearPrimatives(): void{
        for(const prim of this._primatives.values()){
            ensureDefined(this._series).detachPrimitive(prim);
        }
        this._primatives.clear();
    }

    /**
     * Remove drawing primative from the chart
     * 
     * @param drawingId 
     */
    removePrimative(drawingId: string): void{
        const prim = this._primatives.get(drawingId);
        if(!prim) return;

        ensureDefined(this._series).detachPrimitive(prim);
        this._primatives.delete(drawingId);
    }

    /**
     * Sets the IChartApi as draggable or not.  Use this to override drag behavior when manipulating a drawing
     * 
     * @param enable 
     */
    setChartDraggable(enable: boolean): void {
        this._chart.applyOptions({
            handleScroll: enable,  // Toggle scroll behavior
        });
    }

    /**
     * Replace series.update().  Updates the series data and expands the whitespace as necessary
     * @param bar 
     */
    private _updateSyncSeriesAndDummySeries(bar: CandlestickData<Time>): void{
        if(bar.time > this.lastSeriesDate){ 
            const dummyBars = generateDummyBars(this.lastWhitespaceDate, this._secondsPerBar, 1)
            this._whiteSpaceSeries.update(dummyBars[0])
        }
    }
}

