import { CandlestickData, ISeriesApi, LineSeries, MouseEventParams, SeriesType, Time } from "lightweight-charts";

import { IChartApi } from "lightweight-charts";
import { PluginBase } from "../../plugins/plugin-base.ts";
import { ensureDefined } from "../../common/utils/assertions.ts";
import { ChartDrawingsManager } from "../chart-drawings-manager.ts";
import { ChartDrawingBase } from "../drawings/chart-drawing-base.ts";
import { createChartMouseHandlers, initializeListeners, removeListeners } from "./chart-mouse-handlers.ts";
import { removeListener } from "process";

type DummyBar = {
    time : Time,
    value : number
}

// container of IChartApi and ISeriesApi, extends to include some additional properties
// The main purpose of this is to track the drawing primatives on a chart, 
// and to manage the event handlers (we are not using the provided ones by IChartApi since they are limited))
// since a ChartDrawing can be applied to multiple charts, but a primate (the actual drawing object on the chart) can only be applied to one chart.
export class ChartContainer {
    private _chartManager: ChartDrawingsManager;
    private _chartDivContainer: HTMLDivElement;
    private _chartId: string;
    private _symbolName: string;
    private _secondsPerBar: number;
    private _tags: string[] = [];
    private _chart: IChartApi;
    private _series: ISeriesApi<SeriesType>;
    private _primatives : PluginBase[] = [];  // TODO; we dont need this, its tracked within the drawingView
    private _handlers: ReturnType<typeof createChartMouseHandlers>;

    private _whiteSpaceTotal: number = 100;
    private _whiteSpaceSeries: ISeriesApi<SeriesType>;
    private _lastSeriesDate : Time;
    private _lastWhiteSpaceSeriesDate : Time;
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
    //public get primatives(): PluginBase[] { return this._primatives;}
    public get chartId(): string { return this._chartId;}
    public get tags(): string[] { return this._tags;}
    public get chartDivContainer(): HTMLDivElement { return this._chartDivContainer;}
    public get chartManager(): ChartDrawingsManager { return this._chartManager;  }

    dispose() : void{
        removeListeners(this._handlers, this);
        this._chart.remove();
    }

    	// needs to be set on init, or here
	setData(data: CandlestickData[]) : boolean{
		if(!data.length) 
			return false

		this._dataInitialized = true
		this._lastSeriesDate = data[data.length - 1].time;
		this._whiteSpaceSeries = this._initWhitespaceSeries(data)
		this._series.setData(data)

		// scroll to position
		this._autoScrollToPosition(true)

        return true;
	}

	// this must be called when new data is added
	public updateData(bar : CandlestickData){
		if(!this._dataInitialized)
			throw new Error('Cant updateData before initializing base data')

		this._series.update(bar) // update series with new data.  track number of new bars

		if(bar.time > this._lastSeriesDate){ // if we have new bars, generate same amount of dummy bars to keep the whitespacing
			this._lastSeriesDate = bar.time
			const dummyBars = this._generateDummyBars(this._lastWhiteSpaceSeriesDate, this._secondsPerBar, 1)
			this._whiteSpaceSeries.update(dummyBars[0])
			this._lastWhiteSpaceSeriesDate = dummyBars[dummyBars.length - 1].time
			this._autoScrollToPosition(false)
		}
	}

    isValid(symbolName: string, secondsPerBar: number, tags: string[]) : boolean{
        if(this._symbolName !== symbolName ||
            this._secondsPerBar !== secondsPerBar ||
            this._tags.length !== tags.length ||
            this._tags.some((tag, index) => tag !== tags[index]) // the chart should match at least one of these tags.  Is that the correct behavior we want?
        )
            return false;
        return true;
    }

    // adds a new primative to the series
    addDrawingPrimative(primative: PluginBase) : void{
        console.log('addDrawingPrimative', primative);
        ensureDefined(this._series).attachPrimitive(primative); // add to series, draws on the chart
    }

    // updates a primative by replacing it
    updateDrawingPrimative(drawing: ChartDrawingBase) : void{
        //const primative = drawing.primative;
        this.removeDrawingPrimative(drawing.drawingView?.baseId ?? "");
        this.addDrawingPrimative(drawing.drawingView as PluginBase);
    }

    // removes a primative from the series
    removeDrawingPrimative(id: string) : void{
        const primative = this._primatives.find(p => p.baseId === id);
        if(primative){
            console.log('removeDrawingPrimative', primative);
            ensureDefined(this._series).detachPrimitive(primative);
            this._primatives = this._primatives.filter(p => p.baseId !== id);
        }
    }

    remPrim(primative?: PluginBase) : void{
        if(!primative)
            return
        console.log('remPrim', primative);
        ensureDefined(this._series).detachPrimitive(primative);
    }

    // re-syncs all primatives with the chartDrawings
    // this is not ideal, its slow, so use sparingly
    // better to call the individual updates
    updatePrimatives(primatives: PluginBase[]) : void{
        console.log('updatePrimatives', primatives);
        // remove all primatives
       for(const primate of this._primatives)
            ensureDefined(this._series).detachPrimitive(primate);
        
        // re-add all primatives
        for(const primative of primatives)
            this.addDrawingPrimative(primative);
    }

    setChartDraggable(enable: boolean): void {
        this._chart.applyOptions({
            handleScroll: enable,  // Toggle scroll behavior
        });
    }

    private _initWhitespaceSeries(data : CandlestickData[]): ISeriesApi<SeriesType>{
        const whitespaceSeries = this._chart.addSeries(LineSeries);
    
        // apply initial bar data to whitespace series
        const whiteSpaceData = data.map(candle => ({
            time: candle.time,
            value: 0,
        } as DummyBar));
    
        // generate data padding to whitespace series,
        const dummyBars = this._generateDummyBars(data[data.length - 1].time, this._secondsPerBar, this._whiteSpaceTotal)
        whiteSpaceData.push(...dummyBars);
    
        // apply  whitespace data to series
        whitespaceSeries.setData(whiteSpaceData) 
        this._lastWhiteSpaceSeriesDate = whiteSpaceData[whiteSpaceData.length - 1].time
        
        return whitespaceSeries
    }
    
    private _generateDummyBars(startTime: Time, secondsPerBar: number, totalToGenerate: number): DummyBar[] {
        const newTimes: DummyBar[] = [];
        let timeNum = Number(startTime); 
    
        for (let i = 0; i < totalToGenerate; i++) {
            timeNum += secondsPerBar;
            newTimes.push({
                time: timeNum as Time,
                value: 0,
            } as DummyBar);
        }
    
        return newTimes;
    }

    private _autoScrollToPosition(forceToPosition : boolean){
        const barsToEndOfChart : number = this._barsFromLastBarToEnd(this._chart, this._series)
        const withinRange = barsToEndOfChart <= this._autoScrollBars && barsToEndOfChart > 0

        if(forceToPosition || withinRange)
            this._chart.timeScale().scrollToPosition(-(this._whiteSpaceTotal - this._autoScrollBars), false);
	}

    private _barsFromLastBarToEnd(chart: IChartApi, series: ISeriesApi<any>): number {
        const logicalRange = chart.timeScale().getVisibleLogicalRange();
        if (!logicalRange) return 0;
    
        const data = series.data();
        if (!data || data.length === 0) return 0;

        const lastDataIndex = data.length - 1; 

        const visibleTo = Math.floor(logicalRange.to);
        return Math.max(0, visibleTo - lastDataIndex);
    }
}

