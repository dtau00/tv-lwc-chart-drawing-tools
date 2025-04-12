import { ISeriesApi, MouseEventParams, SeriesType } from "lightweight-charts";

import { IChartApi } from "lightweight-charts";
import { PluginBase } from "../plugins/plugin-base.ts";
import { ensureDefined } from "../helpers/assertions.ts";
import { ChartDrawingsManager } from "./chart-drawings-manager.ts";
import { ChartDrawingBase } from "./drawings/chart-drawing-base.ts";

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

        this._initializeListeners();
    }

    public get chart(): IChartApi { return this._chart;}
    public get series(): ISeriesApi<SeriesType> { return this._series;} 
    public get symbolName(): string { return this._symbolName;}
    public get secondsPerBar(): number { return this._secondsPerBar;}
    //public get primatives(): PluginBase[] { return this._primatives;}
    public get chartId(): string { return this._chartId;}
    public get tags(): string[] { return this._tags;}
    public get chartDivContainer(): HTMLDivElement { return this._chartDivContainer;}

    dispose() : void{
        this._removeListeners();
        this._chart.remove();
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

    // preview primative -------------------------------------------------------------
    // primatives are currnently managed by the Drawing itself, since it can only apply to one chart at a time
    /*
    createPreviewDrawingPrimative<T>(drawing: PluginBase){
        this._previewPrimative = drawing;
        ensureDefined(this._series).attachPrimitive(drawing);
    }

    removePreviewDrawingPrimative(drawing: PluginBase){
        this._previewPrimative = null;
        ensureDefined(this._series).detachPrimitive(drawing);
    }*/

    // event handlers coordinated by the ChartDrawingsManager-----------------------------------------------
    // we will initialize the listeners here, but the chart manager will control it for the most part
    // makes it cleaner to dispose the listeners

    private _initializeListeners() : void{
       this._chart.subscribeCrosshairMove(this._onCrosshairMoveChartHandler);

        this._chartDivContainer .addEventListener('mousedown', this._onMouseDownChartHandler);
        this._chartDivContainer .addEventListener('mouseup', this._onMouseUpChartHandler);
        this._chartDivContainer .addEventListener('contextmenu', this._rightClickHandler);
       this._chartDivContainer .addEventListener('wheel', this._onWheelChart);
   }

    private _removeListeners() : void{
        this._chart.unsubscribeCrosshairMove(this._onCrosshairMoveChartHandler)    

        this._chartDivContainer.removeEventListener('mousedown', this._onMouseDownChartHandler);
        this._chartDivContainer.removeEventListener('mouseup', this._onMouseUpChartHandler);
        this._chartDivContainer.removeEventListener('contextmenu', this._rightClickHandler);
        this._chartDivContainer.removeEventListener('wheel', this._onWheelChart);
    }
    
    private _onCrosshairMoveChartHandler = (param: MouseEventParams) : void => {
        this._chartManager.onMouseMove(param);
        this._chartManager.checkCurrentChartContainer(this);
        this._chartManager.selectedDrawing?.onMouseMove(param);
    }

    private _rightClickHandler=(evt: MouseEvent): void => {
        evt.preventDefault()
        this._chartManager.onRightClick(evt, this)
    }

    // mouse down, we want to detect if its dragging
    private _onMouseDownChartHandler=(evt: MouseEvent): void => {
        this._chartManager.onMouseDown(evt, this);
    }       

    private _onMouseUpChartHandler=(evt: MouseEvent): void => {
        this._chartManager.onMouseUp(evt, this);
    }

    private _onWheelChart=(evt: WheelEvent): void => {
        //console.log('onWheelChart', evt);
    }
}

