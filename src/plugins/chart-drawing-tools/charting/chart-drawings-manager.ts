import { IChartApi, ISeriesApi, MouseEventParams, SeriesType, } from 'lightweight-charts';
import { ChartDrawing, ChartDrawingBaseProps } from './drawings/base/chart-drawing-base.ts';
import { DrawingToolType } from './toolbar/drawing-tools.ts';
import { RectangleDrawing } from './drawings/rectangle/rectangle-drawing.ts';
import { DataStorage } from '../data/data.ts';
import { eventBus } from '../common/common.ts';
import { ChartContainer } from './chart-container.ts';
import Tool from './toolbar/base/tool-base.ts';
import { ChartEvents } from '../enums/events.ts';
import { PluginBase } from '../../plugin-base.ts';

// manage charts
    // when chart is created, register it with ChartManager
    // when chart is destroyed, unregister it from ChartManager

    // when a chart is created, it will load all drawings from the database
    // when a chart is destroyed, it will save all drawings to the database 

    // when drawings are added, updated, removed for a symbol, it will also update drawings for all other charts that use the same symbol

export class ChartDrawingsManager {
    private static instance: ChartDrawingsManager;
    private _drawings: Map<string, ChartDrawing[]> = new Map(); // symbolName -> drawings
    private _chartContainers: Map<string, ChartContainer>= new Map();
    private _currentDrawingTool: Tool | null; // currently selected drawing tool
    private _selectedDrawing: ChartDrawing | null;
    private _previewDrawing: ChartDrawing | null;
    private _charts: Map<string, IChartApi> = new Map();
    private _currentChartContainer: ChartContainer | null; // current chart mouse is hovering over
    private _creatingNewDrawingFromToolbar: boolean = false;
    private constructor() {
        this._charts = new Map();
        this._drawings = new Map();

        this._listenForChartEvents();
    }

    get drawings(): Map<string, ChartDrawing[]> { return this._drawings;}
    get selectedDrawing(): ChartDrawing | null { return this._selectedDrawing;}
    get currentChartContainer(): ChartContainer | null { return this._currentChartContainer;}
    get currentDrawingTool(): Tool | null { return this._currentDrawingTool;}
    get creatingNewDrawingFromToolbar(): boolean { return this._creatingNewDrawingFromToolbar;}

    public static getInstance(): ChartDrawingsManager {
        if (!ChartDrawingsManager.instance) {
            ChartDrawingsManager.instance = new ChartDrawingsManager();
        }
        return ChartDrawingsManager.instance;
    }

    public registerChart(chartDivContainer: HTMLDivElement, chart: IChartApi, series: ISeriesApi<SeriesType>, id: string, symbolName: string, secondsPerBar: number, tags: string[]): void {
        if (!chartDivContainer || !chart || !series || !id || !symbolName || !secondsPerBar || !tags) return;

        const chartContainer = new ChartContainer(this, chartDivContainer, chart, series, id, symbolName, secondsPerBar, tags);
        this._chartContainers.set(id, chartContainer);
        

        //this.loadDrawings(chart, series, symbolName)
        this._loadDrawings(chartContainer);
    }

    public disposeChart(chartContainer: ChartContainer): void {
        chartContainer.dispose();
    }

    public getChart(chartId: string): IChartApi | undefined {
        return this._charts.get(chartId);
    }

    public selectDrawing(drawing: ChartDrawing): void {
        this.unselectDrawing();
        this._selectedDrawing = drawing;
    }

	public unselectDrawing(): void {
        this._selectedDrawing?.deselect();
		this._selectedDrawing = null;
	}

    public unselectTool(): void {
        this._currentDrawingTool = null;
        this._creatingNewDrawingFromToolbar = false;
    }

    public clearDrawings(symbolName: string): void {
        // remove all drawings for the symbol
    }

    public saveDrawings(symbolName: string): void {
        // create base data to be serialized
        const symbolDrawings = this._drawings.get(symbolName) || []; // get all drawings for symbol
        let data = symbolDrawings.map(drawing => drawing.baseProps); // get map data
        console.log("save drawings for ", symbolName, data);
        DataStorage.saveData<ChartDrawingBaseProps[]>(`${symbolName}-drawings`, data); // save drawings for symbol
    }

    private _loadDrawings(chartContainer: ChartContainer): void {
        const symbolName = chartContainer.symbolName;
        const data = DataStorage.loadData<ChartDrawingBaseProps[]>(`${symbolName}-drawings`, []);
        for(const item of data){
            if(item.symbolName === symbolName){
                if(!this._drawings.has(symbolName)){
                    this._drawings.set(symbolName, []);
                }
                console.log("loading drawings for ", symbolName, item);
                
                // TODO clean this up
                if(item.type === DrawingToolType.Rectangle){
                    const drawing = new RectangleDrawing(chartContainer.chart, chartContainer.series, symbolName, item);
                    this._drawings.get(symbolName)?.push(drawing);
                    chartContainer.addDrawingPrimative(drawing.primative as PluginBase);
                   // drawing.draw(chart, series);
                }
            }
        }
        console.log("all loaded drawings ", this._drawings);
    }
    /*
    public loadDrawings(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): void {
        const data = DataStorage.loadData<BaseChartDrawingData[]>('test', []);
        for(const item of data){
            if(item.symbolName === symbolName){
                if(!this._drawings.has(symbolName)){
                    this._drawings.set(symbolName, []);
                }
                console.log("loading drawing", item);
                // TODO clean this up
                if(item.type === DrawingToolType.Rectangle){
                    const drawing = new RectangleDrawing(chart, series, symbolName, item);
                    this._drawings.get(symbolName)?.push(drawing);
                    drawing.draw(chart, series);
                }
            }
        }
    }*/

    public removeSelectedDrawing(): void {
       if(!this._selectedDrawing)
            return;

       // remove the actual primative from all charts
       // todo filter by symbol
       //const charts = this._chartContainers.values().filter(o => o.symbolName == this._selectedDrawing?.symbolName)
       for(const chart of this._chartContainers.values()){
            chart.remPrim(this._selectedDrawing.primative)
       }

       this._selectedDrawing.remove();
        const drawings = this._drawings.get(this._selectedDrawing.symbolName) || [];
        this._drawings.set(this._selectedDrawing.symbolName, drawings.filter(d => d !== this._selectedDrawing));
        this.saveDrawings(this._selectedDrawing.symbolName);
        this.unselectDrawing();
    }

    public destroy(): void {
       this._charts.clear();
       this._drawings.clear();
       eventBus.removeEventListener(ChartEvents.NewDrawingCompleted, this._listenForChartEvents);
       for(const chartContainer of this._chartContainers.values()){
        chartContainer.dispose();
       }
       this._chartContainers.clear();
	}

    // making this more explicit, should only be set by the ChartContainer
    public checkCurrentChartContainer(container: ChartContainer | null): void {
        if(container !== this._currentChartContainer){ 
            console.log("changing current chart container", container);
            if(this._currentChartContainer?.chartId)
                this._emitCloseToolbarEvent(this._currentChartContainer.chartId);
            if(container?.chartId)
                this._emitOpenToolbarEvent(container.chartId, this._currentDrawingTool?.toolType || DrawingToolType.None);
            this._currentChartContainer = container;

            if(this._creatingNewDrawingFromToolbar){
                this.startToolDrawing(this._currentDrawingTool!);
                console.log('switched charts while new drawing in progress, restart drawing')
            }
        }
    }

    public startToolDrawing(tool: Tool): void {
        if(!tool || !this._currentChartContainer) 
            return;
        this._selectedDrawing?.stopDrawing();
        this._creatingNewDrawingFromToolbar = true;
        this._currentDrawingTool = tool;
        this.unselectDrawing();
    }

    public handleOnClickChart(param: MouseEventParams, chartContainer: ChartContainer){
        // Ceating a new drawing
        console.log('onClickChartHandler ChartContainer', chartContainer.chartId);
        this.checkCurrentChartContainer(chartContainer);

        if(this.creatingNewDrawingFromToolbar){
            if(!this.selectedDrawing){ // start of new drawing
                const drawing =this.currentDrawingTool?.getNewDrawingObject(chartContainer.chart, chartContainer.series, chartContainer.symbolName);
                this.selectDrawing(drawing!);
                console.log('new drawing initiated', drawing);
            }
            this.selectedDrawing?.onClick(param); // pass onclick to drawing for more processing
        }
        else if(!this.selectedDrawing || this.selectedDrawing.isCompleted){
            if(param?.point){
                let drawingFound :boolean= false;
                console.log('selectedDrawing', this.selectedDrawing);
                const drawings = this._drawings.get(chartContainer.symbolName) || [];
                for(const drawing of drawings){
                    //console.log('check drawing', drawing);
                    if(drawing.containsPoint(chartContainer.chart, chartContainer.series, param.point, drawing.drawingPoints)){
                        this.selectDrawing(drawing);
                        drawing.select();
                        drawingFound = true;
                        break;
                    }
                }
                if(!drawingFound){
                    this.unselectDrawing();
                    //console.log('no drawing found');
                }
            }
        }
        else{ 
            //mgr.selectedDrawing?.onClick(param);
            alert('unknown state')
            //console.log('else');
            /*
            const drawing =this._chartManager.currentDrawingTool?.getNewDrawingObject(this._chart, this._series, this._symbolName);
            if(drawing){
                this._chartManager.selectDrawing(drawing);
                mgr.selectedDrawing?.onClick(param);
            }*/
        }
         // TODO handle modifications (moving, resizing, etc)
    }

    private _addPrimativeToChartContainers(symbolName: string, primative: PluginBase): void {
        const containers = Array.from(this._chartContainers.values()).filter(c => c.symbolName === symbolName);
        for(const container of containers){
            container.addDrawingPrimative(primative);
        }
    }

    private _emitCloseToolbarEvent(chartId: string): void {
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.UnsetToolbar, { detail: {chartId: chartId} }));
    }

    private _emitOpenToolbarEvent(chartId: string, toolType: DrawingToolType): void {
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.SetToolbar, { detail: {chartId: chartId, toolType: toolType} }));
    }

    private _listenForChartEvents=()=> {
        eventBus.addEventListener(ChartEvents.NewDrawingCompleted, (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            console.log(`Chart Manager: Chart ${customEvent.detail} has finished rendering.`);
            if(this._selectedDrawing){  
                const drawings = this._drawings.get(this._selectedDrawing.symbolName) || [];
                this._drawings.set(this._selectedDrawing.symbolName, [...drawings, this._selectedDrawing]);
                this.saveDrawings(this._selectedDrawing.symbolName);
                this._addPrimativeToChartContainers(this._selectedDrawing.symbolName, this._selectedDrawing.primative as PluginBase);
            }
            this._creatingNewDrawingFromToolbar = false;
            this.unselectDrawing();
        });
    }
}
