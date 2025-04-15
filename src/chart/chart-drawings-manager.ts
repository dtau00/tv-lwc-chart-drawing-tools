import Tool from './toolbar/tools/tool-base.ts';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from './drawings/chart-drawing-base.ts';
import { DataStorage } from '../common/storage.ts';
import { ChartContainer } from './chart-container/chart-container.ts';
import { DrawingObjectFactory } from '../common/factories/drawing-tool-to-object-factory.ts';
import { ChartDrawingsToolbarManager } from './toolbar/chart-drawing-toolbar-manager.ts';
import { initializeEventBus } from './toolbar/chart-drawing-toolbar-event-bus-handlers.ts';

// manage charts
    // when chart is created, register it with ChartManager
    // when chart is destroyed, unregister it from ChartManager

    // when a chart is created, it will load all drawings from the database
    // when a chart is destroyed, it will save all drawings to the database 

    // when drawings are added, updated, removed for a symbol, it will also update drawings for all other charts that use the same symbol

export class ChartDrawingsManager {
    private static instance: ChartDrawingsManager;

    private _drawings: Map<string, ChartDrawingBase[]> = new Map(); // symbolName -> drawings
    private _chartContainers: Map<string, ChartContainer>= new Map();
    private _currentDrawingTool: Tool | null; // currently selected drawing tool
    private _selectedDrawing: ChartDrawingBase | null;
    private _charts: Map<string, IChartApi> = new Map();
    private _currentChartContainer: ChartContainer | null; // current chart mouse is hovering over
    private _creatingNewDrawingFromToolbar: boolean = false;
    private _initalized: boolean = false
    private _drawingFactoryMap = DrawingObjectFactory;
    public toolbarManager = new ChartDrawingsToolbarManager()
    //private _drawingFactoryMap: Partial<Record<DrawingToolType, (chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string, item: ChartDrawingBaseProps) => ChartDrawingBase>> = DrawingObjectFactory;
    
    private constructor() {
        this._charts = new Map();
        this._drawings = new Map();
        initializeEventBus(this);
    }

    get drawings(): Map<string, ChartDrawingBase[]> { return this._drawings;}
    get selectedDrawing(): ChartDrawingBase | null { return this._selectedDrawing;}
    get currentChartContainer(): ChartContainer | null { return this._currentChartContainer;}
    get currentDrawingTool(): Tool | null { return this._currentDrawingTool;}
    get creatingNewDrawingFromToolbar(): boolean { return this._creatingNewDrawingFromToolbar;}
    set creatingNewDrawingFromToolbar(val : boolean) { this._creatingNewDrawingFromToolbar = val}

    public static getInstance(): ChartDrawingsManager {
        if (!ChartDrawingsManager.instance) {
            ChartDrawingsManager.instance = new ChartDrawingsManager();
        }
        return ChartDrawingsManager.instance;
    }

    public registerChart(chartDivContainer: HTMLDivElement, chart: IChartApi, series: ISeriesApi<SeriesType>, id: string, symbolName: string, secondsPerBar: number, tags: string[]): ChartContainer | null {
        if (!chartDivContainer || !chart  || !series || !id || !symbolName || !secondsPerBar || !tags) 
            return null;

        if(!this._initalized){ // only initialize once. We cant do this in getInstance because its static
            document .addEventListener('keydown', this._onKeyDown);
            this._initalized = true
        }

        const chartContainer = new ChartContainer(this, chartDivContainer, chart, series, id, symbolName, secondsPerBar, tags);
        this._chartContainers.set(id, chartContainer);
        
        this._loadDrawings(chartContainer);
        return chartContainer
    }

    public registerToolbar(toolbarDivContainer: HTMLDivElement, subToolbarDivContainer: HTMLDivElement, chartId?: string){
        this.toolbarManager.addToolbar(toolbarDivContainer, subToolbarDivContainer, chartId)
    }

    public disposeChart(chartContainer: ChartContainer): void {
        document .removeEventListener('keydown', this._onKeyDown);
        chartContainer.dispose();
    }

    public getChart(chartId: string): IChartApi | undefined {
        return this._charts.get(chartId);
    }

    public setSelectedDrawing(drawing: ChartDrawingBase): void {
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

    public saveDrawings(symbolName: string): void {
        // create base data to be serialized
        const symbolDrawings = this._drawings.get(symbolName) || []; // get all drawings for symbol
        let data = symbolDrawings.map(drawing => drawing.getBasePropsForLoading()); // get map data
        //console.log("save drawings for ", symbolName, data);
        DataStorage.saveData<ChartDrawingBaseProps[]>(`${symbolName}-drawings`, data); // save drawings for symbol
        this._reDrawChartDrawingsForCharts(symbolName)
    }

    // TODO this is messy, can be cleaned up
    public removeDrawingsForCurrentChartSymbol(){
        if(!this._currentChartContainer) return

        const symbolName = this._currentChartContainer.symbolName
        const drawings = this._drawings.get(symbolName) ?? [];
        const charts = Array.from(this._chartContainers.values())
            .filter(o => o.symbolName === symbolName);

        // remove all primatives and drawings all charts
        for(const drawing of drawings){ // iterate through all drawings
            for(const chart of charts) // iterate all charts for each drawing
                chart.removePrimative(drawing.id) // remove primative from chart
            drawing.remove() // dispose
        }

        this._drawings.set(symbolName, []); // clear out all drawings
        this.saveDrawings(symbolName); // save empty list
    }

    public removeSelectedDrawing(): void {
       if(!this._selectedDrawing) return;

        // remove primative from all chart
       const charts = this.getChartContainersForSymbol(this._selectedDrawing.symbolName)
       for(const chart of charts){
            chart.removePrimative(this._selectedDrawing.id)
       }

       this._selectedDrawing.remove();
        const drawings = this._drawings.get(this._selectedDrawing.symbolName) || [];
        this._drawings.set(this._selectedDrawing.symbolName, drawings.filter(d => d !== this._selectedDrawing));
        this.saveDrawings(this._selectedDrawing.symbolName);
        this.unselectDrawing();
        document.body.style.cursor = 'default';
    }

    public dispose(): void {
       this._charts.clear();
       this._drawings.clear();
       for(const chartContainer of this._chartContainers.values()){
            chartContainer.dispose();
       }
       this._chartContainers.clear();
	}

    // making this more explicit, should only be set by the ChartContainer
    public switchCurrentContainerIfChanged(container: ChartContainer | null): void {
        if(container !== this._currentChartContainer){ 
            console.log("changing current chart container", container);

            // switch current containers
            const previousCurrentContainer = this._currentChartContainer
            this._currentChartContainer = container

            // close previous toolbar, open current
            if(previousCurrentContainer?.chartId)
                this.toolbarManager.unsetToolbar(previousCurrentContainer.chartId)
            if( this._currentChartContainer?.chartId)
                this.toolbarManager.setToolbar(this._currentChartContainer.chartId)
               // this.openToolbars(this._currentChartContainer.chartId, this._currentDrawingTool?.toolType || DrawingToolType.None);

            // redraw all drawings for the last current chart container, before switching
            const previousChartDrawings = this._getDrawingsForChartContainer(previousCurrentContainer)
            previousCurrentContainer?.reDrawChartDrawings(previousChartDrawings)

            // set all drawings to current chart, so it will update primates on the correct chart
            // TODO, a bit of a hack, we might just have the manager control the active drawing primatives
            const currentChartDrawings = this._getDrawingsForChartContainer(this._currentChartContainer)
            this.currentChartContainer?.setChartDrawingsToThisChart(currentChartDrawings)

            // if we are creating a new drawing...
            if(this._creatingNewDrawingFromToolbar){
                this.startNewDrawing(this._currentDrawingTool!);
                console.log('switched charts while new drawing in progress, restart drawing')
            }
        }
    }

    public getChartContainersForSymbol(symbol: string){
        return  Array.from(this._chartContainers.values())
            .filter(c => c.symbolName === symbol);
    }

    public startNewDrawing(tool: Tool): void {
         this._selectedDrawing?.stopDrawing();
         this._creatingNewDrawingFromToolbar = true;
         this._currentDrawingTool = tool;
         this.unselectDrawing();
     }


    private _getDrawingsForChartContainer(chartContainer?: ChartContainer | null): ChartDrawingBase[]{
        if(!chartContainer) return []
            
        return  this.drawings.get(chartContainer.symbolName) ?? []
    }

    // redraw the chart drawings for a given symbol.  option to skip curent chart (which goes through a different rendering pipeline)
    private _reDrawChartDrawingsForCharts(symbol: string, skipCurrentChart: boolean = true){
        const drawings = this._drawings.get(symbol)
        const charts = this._chartContainers.values()
        if(!drawings || !charts) return

        for(const chart of charts){
            const dontSkip = (!skipCurrentChart || chart.chartId !== this._currentChartContainer?.chartId)
            if(chart.symbolName === symbol && dontSkip)
                chart.setChartDrawings(drawings)
        }
    }

    private _loadDrawings(chartContainer: ChartContainer): void {
        const symbolName = chartContainer.symbolName;

        if (!this._drawings.has(symbolName)) {
            this._drawings.set(symbolName, []);
            const data = DataStorage.loadData<ChartDrawingBaseProps[]>(`${symbolName}-drawings`, []);
            console.log("loading drawings for ", symbolName);
    
            for (const item of data) {
                if (item.symbolName === symbolName) {
                    const factory = this._drawingFactoryMap[item.type];
                    if (factory) {
                        const drawing = factory(chartContainer.chart, chartContainer.series, symbolName, item);
                        this._drawings.get(symbolName)?.push(drawing);
                        chartContainer.setChartDrawing(drawing);
                    } else {
                        console.warn(`No factory found for drawing type: ${item.type}`);
                    }
                }
            }
        } else {
            console.log("drawings already loaded for chart, just adding primatives ", symbolName);
            const drawings = this._drawings.get(symbolName) || [];
            for (const drawing of drawings) {
                chartContainer.setChartDrawing(drawing);
            }
        }
    
        console.log("all loaded drawings ", this._drawings);
    }

    // Chart Event Handlers ------------------------------------------------------------
    private _onKeyDown = (evt: KeyboardEvent): void => {
        if (evt.key === 'Delete' || evt.key === 'Backspace') {
            this.removeSelectedDrawing();
        }
    }
}

