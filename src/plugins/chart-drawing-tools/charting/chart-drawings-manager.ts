import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType, Coordinate } from 'lightweight-charts';
import { ChartDrawing, ChartDrawingBaseProps } from './drawings/chart-drawing-base.ts';
import { DrawingToolType } from './toolbar/tools/drawing-tools.ts';
import { RectangleDrawing } from './drawings/rectangle/rectangle-drawing.ts';
import { DataStorage } from '../data/data.ts';
import { eventBus } from '../common/common.ts';
import { ChartContainer } from './chart-container.ts';
import Tool from './toolbar/tools/tool-base.ts';
import { ChartEvents } from '../enums/events.ts';
import { PluginBase } from '../../plugin-base.ts';
import { containsPoints, getChartPointFromMouseEvent, getPointFromMouseEvent } from '../common/points.ts';

// manage charts
    // when chart is created, register it with ChartManager
    // when chart is destroyed, unregister it from ChartManager

    // when a chart is created, it will load all drawings from the database
    // when a chart is destroyed, it will save all drawings to the database 

    // when drawings are added, updated, removed for a symbol, it will also update drawings for all other charts that use the same symbol

export class ChartDrawingsManager {
    private static readonly MouseHoldTimeMs = 400;
    private static readonly MouseHoldMaxOffsetPoints = 3;
    private static instance: ChartDrawingsManager;

    private _drawings: Map<string, ChartDrawing[]> = new Map(); // symbolName -> drawings
    private _chartContainers: Map<string, ChartContainer>= new Map();
    private _currentDrawingTool: Tool | null; // currently selected drawing tool
    private _selectedDrawing: ChartDrawing | null;
    private _previewDrawing: ChartDrawing | null;
    private _charts: Map<string, IChartApi> = new Map();
    private _currentChartContainer: ChartContainer | null; // current chart mouse is hovering over
    private _creatingNewDrawingFromToolbar: boolean = false;

    private _mouseDownStartPoint: Point | null = null;
    private _mousePosition: Point | null = null;
    private _isMouseDragging: boolean = false;
    private _mouseHoldTimer: NodeJS.Timeout | null = null;

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
        if (!chartDivContainer || !chart  || !series || !id || !symbolName || !secondsPerBar || !tags) return;

        const chartContainer = new ChartContainer(this, chartDivContainer, chart, series, id, symbolName, secondsPerBar, tags);
        this._chartContainers.set(id, chartContainer);
        
        document .addEventListener('keydown', this._onKeyDown);
        //this.loadDrawings(chart, series, symbolName)
        this._loadDrawings(chartContainer);
    }

    public disposeChart(chartContainer: ChartContainer): void {
        document .removeEventListener('keydown', this._onKeyDown);
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
        if(!this._drawings.has(symbolName)){
            this._drawings.set(symbolName, []);
            const data = DataStorage.loadData<ChartDrawingBaseProps[]>(`${symbolName}-drawings`, []);
            console.log("loading drawings for ", symbolName);
            for(const item of data){
                if(item.symbolName === symbolName){
                    // TODO clean this up
                    if(item.type === DrawingToolType.Rectangle){
                        const drawing = new RectangleDrawing(chartContainer.chart, chartContainer.series, symbolName, item);
                        this._drawings.get(symbolName)?.push(drawing);
                        chartContainer.addDrawingPrimative(drawing.primative as PluginBase);
                       // drawing.draw(chart, series);
                    }
                }
            }
        }
        else{
            console.log("drawings already loaded for chart, just adding primatives ", symbolName);
            const drawings = this._drawings.get(symbolName) || [];
            for(const drawing of drawings){
                chartContainer.addDrawingPrimative(drawing.primative as PluginBase);
            }
        }

        console.log("all loaded drawings ", this._drawings);
    }

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

    private _addPrimativeToChartContainers(symbolName: string, primative: PluginBase): void {
        const containers = Array.from(this._chartContainers.values()).filter(c => c.symbolName === symbolName);
        for(const container of containers){
            container.addDrawingPrimative(primative);
        }
    }

    // Event Bus Handlers ------------------------------------------------------------  

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

    // Chart Event Handlers ------------------------------------------------------------

    public onChartClick(param: MouseEventParams, chartContainer: ChartContainer){
        // Ceating a new drawing
        this.checkCurrentChartContainer(chartContainer);
        console.log('onChartClick', chartContainer.chartId);

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
                        //this._updateChartContainerPrimatives(chartContainer.symbolName, [drawing.primative as PluginBase]);
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
            alert('unknown state')
        }
    }

    public onMouseDown(evt: MouseEvent, chartContainer: ChartContainer): boolean {
        if(!this._selectedDrawing) // only check if a drawing is selected
            return false;

        this._mouseDownStartPoint = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer); // set original mouse down position
        this._mouseHoldTimer = setTimeout(() => this._mouseHoldTimeout(chartContainer.chart), ChartDrawingsManager.MouseHoldTimeMs);
        return true;
    }

    public onMouseUp(evt: MouseEvent): void {
        if(this._isMouseDragging){
            this._selectedDrawing?.setTmpToNewDrawingPoints();
            this.saveDrawings(this._selectedDrawing?.symbolName || '');
        }
        this._resetMouseControls();
    }

    public onMouseMove(param: MouseEventParams): void {
        if((!param.point))
            return;

        this._mousePosition = param.point || null; 
        if(this._isMouseDragging && this._mouseDownStartPoint && this._selectedDrawing){
            // move drawing
            this._selectedDrawing?.updatePosition(this._mouseDownStartPoint, param.point);
        }
    }

    public onRightClick(evt: MouseEvent, chartContainer: ChartContainer): void {
        if(!this._selectedDrawing || !chartContainer.chart || !chartContainer.series)
            return;

        // Deselect if right click is outside of drawing
        const point = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer);  
        if(point && !containsPoints(chartContainer.chart, chartContainer.series, point, this._selectedDrawing.drawingPoints)){
            this.unselectDrawing();
        }
    }

    private _onKeyDown = (evt: KeyboardEvent): void => {
        if (evt.key === 'Delete' || evt.key === 'Backspace') {
            this.removeSelectedDrawing();
        }
    }

    // mouse event hander functions ------------------------------------------------------------

    private _mouseHoldTimeout =(chart: IChartApi) =>{
        if(this._hasMouseMoved())
            return;
        this._isMouseDragging = true;
        this._setChartDragging(chart, false);
        document.body.style.cursor = 'move';
    }

    // check if mouse is being held, allow for some movement before starting drag (if the mouse jitters due to high dpi)
    private _hasMouseMoved(): boolean{
        if(!this._mousePosition || !this._mouseDownStartPoint)
            return false;

        // TODO there's a conversion issue since we use MouseEvent for mousedown and MouseEventParams for mousemove, on y
        const yDiff = 0//Math.abs(this._mousePosition.y - this._mouseDownStartPoint.y);
        const xDiff = Math.abs(this._mousePosition.x - this._mouseDownStartPoint.x);
        const offset = ChartDrawingsManager.MouseHoldMaxOffsetPoints;
        return (xDiff > offset || yDiff > offset)
    }

    private _setChartDragging(chart: IChartApi, enable: boolean): void {
        chart.applyOptions({
            handleScroll: enable,  // Toggle scroll behavior
        });
    }

    private _resetMouseControls(): void {
        document.body.style.cursor = 'default';
        this._mouseDownStartPoint = null;
        this._isMouseDragging = false;
        if(this._mouseHoldTimer)
            clearTimeout(this._mouseHoldTimer);

        if(this._currentChartContainer?.chart)
            this._setChartDragging(this._currentChartContainer.chart, true);
    }
}

