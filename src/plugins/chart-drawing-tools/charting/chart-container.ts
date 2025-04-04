import { ISeriesApi, MouseEventParams, SeriesType } from "lightweight-charts";

import { IChartApi } from "lightweight-charts";
import { PluginBase } from "../../plugin-base.ts";
import { ChartDrawing } from "./drawings/chart-drawing-base.ts";
import { ensureDefined } from "../../../helpers/assertions";
import { ChartDrawingsManager } from "./chart-drawings-manager.ts";

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
    private _primatives : PluginBase[] = [];  // ISeriesApi primative drawings, we must track these manually. Theres no way to get this at the moment.
    private _previewPrimative: PluginBase | null;
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
    public get primatives(): PluginBase[] { return this._primatives;}
    public get chartId(): string { return this._chartId;}
    public get tags(): string[] { return this._tags;}

    dispose(){
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
    addDrawingPrimative(drawing: PluginBase){
        ensureDefined(this._series).attachPrimitive(drawing); // add to series, draws on the chart
        this._primatives.push(drawing); // add to list for tracking
        return true;
    }

    // updates a primative by replacing it
    updateDrawingPrimative(drawing: ChartDrawing){
        if(!(drawing?.primative))
            return;

        const primative = drawing.primative;
        this.removeDrawingPrimative(primative.id);
        this.addDrawingPrimative(primative);
    }

    // removes a primative from the series
    removeDrawingPrimative(id: string){
        const primative = this._primatives.find(p => p.id === id);
        if(primative){
            ensureDefined(this._series).detachPrimitive(primative);
            this._primatives = this._primatives.filter(p => p.id !== id);
        }
    }

    remPrim(primative?: PluginBase){
        if(!primative)
            return
        ensureDefined(this._series).detachPrimitive(primative);
    }

    // re-syncs all primatives with the chartDrawings
    // this is not ideal, its slow, so use sparingly
    // better to call the individual updates
    updatePrimatives(primatives: PluginBase[]){
        // remove all primatives
        for(const primate of this._primatives)
            ensureDefined(this._series).detachPrimitive(primate);
        
        // re-add all primatives
        for(const drawing of primatives)
            this.addDrawingPrimative(drawing);
    }

    // preview primative -------------------------------------------------------------
    createPreviewDrawingPrimative<T>(drawing: PluginBase){
        this._previewPrimative = drawing;
        ensureDefined(this._series).attachPrimitive(drawing);
    }

    removePreviewDrawingPrimative(drawing: PluginBase){
        this._previewPrimative = null;
        ensureDefined(this._series).detachPrimitive(drawing);
    }

    // event handlers coordinated by the ChartDrawingsManager-----------------------------------------------
    // we will initialize the listeners here, but the chart manager will control it for the most part
    // makes it cleaner to dispose the listeners

    private _initializeListeners(){
        this._chart.subscribeClick(this._onClickChartHandler);
       this._chart.subscribeCrosshairMove(this._onCrosshairMoveChartHandler);

        this._chartDivContainer .addEventListener('mousedown', this._onMouseDownChartHandler);
        this._chartDivContainer .addEventListener('mouseup', this._onMouseUpChartHandler);
        this._chartDivContainer .addEventListener('contextmenu', this._rightClickHandler);
       this._chartDivContainer .addEventListener('wheel', this._onWheelChart);
   }

    private _removeListeners(){
        this._chart.unsubscribeClick(this._onClickChartHandler)
        this._chart.unsubscribeCrosshairMove(this._onCrosshairMoveChartHandler)    

        this._chartDivContainer.removeEventListener('mousedown', this._onMouseDownChartHandler);
        this._chartDivContainer.removeEventListener('mouseup', this._onMouseUpChartHandler);
        this._chartDivContainer.removeEventListener('contextmenu', this._rightClickHandler);
        this._chartDivContainer.removeEventListener('wheel', this._onWheelChart);
    }
    
    private _onCrosshairMoveChartHandler = (param: MouseEventParams) => {
        this._chartManager.onMouseMove(param);
        this._chartManager.checkCurrentChartContainer(this);
        this._chartManager.selectedDrawing?.onMouseMove(param);
    }

    private _onClickChartHandler = (param: MouseEventParams) => {
       this._chartManager.onChartClick(param, this);
	}

    private _rightClickHandler=(evt: MouseEvent): void => {
        evt.preventDefault()
        this._chartManager.onRightClick(evt, this._chartDivContainer)
    }

    // mouse down, we want to detect if its dragging
    private _onMouseDownChartHandler=(evt: MouseEvent): void => {
        this._chartManager.onMouseDown(evt, this._chart);
    }       

    private _onMouseUpChartHandler=(evt: MouseEvent): void => {
        this._chartManager.onMouseUp(evt);
    }

    private _onWheelChart=(evt: WheelEvent): void => {
        console.log('onWheelChart', evt);
    }
}

