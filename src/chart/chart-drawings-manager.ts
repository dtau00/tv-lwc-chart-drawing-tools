import { IChartApi, ISeriesApi, MouseEventParams, Point, SeriesType, Time } from 'lightweight-charts';
import { ChartDrawingBase, ChartDrawingBaseProps } from './drawings/chart-drawing-base.ts';
import { DrawingToolType } from './toolbar/tools/drawing-tools.ts';
import { DataStorage } from '../common/storage.ts';
import { ChartContainer } from './chart-container.ts';
import Tool from './toolbar/tools/tool-base.ts';
import { ChartEvents, eventBus } from '../common/event-bus';
import { PluginBase } from '../plugins/plugin-base.ts';
import { getChartPointFromMouseEvent } from '../common/points.ts';

import { RectangleExtendedDrawing } from './drawings/rectangle-extended/rectangle-extended-drawing.ts';
import { RectangleDrawing } from './drawings/rectangle/rectangle-drawing.ts';
import { LineDrawing } from './drawings/line/line-drawing.ts';
import { LineHorizontalDrawing } from './drawings/line-horizontal/line-horizontal-drawing.ts';
import { LineVerticalDrawing } from './drawings/line-vertical/line-vertical-drawing.ts';
import { LineHorizontalRayDrawing } from './drawings/line-horizontal-ray/line-horizontal-ray-drawing.ts';
import { FibonacciDrawing } from './drawings/fibonacci/fibonacci-drawing.ts';

// manage charts
    // when chart is created, register it with ChartManager
    // when chart is destroyed, unregister it from ChartManager

    // when a chart is created, it will load all drawings from the database
    // when a chart is destroyed, it will save all drawings to the database 

    // when drawings are added, updated, removed for a symbol, it will also update drawings for all other charts that use the same symbol

export class ChartDrawingsManager {
    private static readonly MouseHoldTimeMs = 10;
    private static readonly MouseHoldMaxOffsetPoints = 3;
    private static instance: ChartDrawingsManager;

    private _drawings: Map<string, ChartDrawingBase[]> = new Map(); // symbolName -> drawings
    private _chartContainers: Map<string, ChartContainer>= new Map();
    private _currentDrawingTool: Tool | null; // currently selected drawing tool
    private _selectedDrawing: ChartDrawingBase | null;
    private _previewDrawing: ChartDrawingBase | null;
    private _charts: Map<string, IChartApi> = new Map();
    private _currentChartContainer: ChartContainer | null; // current chart mouse is hovering over
    private _creatingNewDrawingFromToolbar: boolean = false;
    private _initalized: boolean = false

    private _mouseDownStartPoint: Point | null = null;
    private _mousePosition: Point | null = null;
    private _isMouseDragging: boolean = false;
    private _mouseHoldTimer: NodeJS.Timeout | null = null;
    private _drawingFactoryMap: Partial<Record<DrawingToolType, (chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string, item: ChartDrawingBaseProps) => ChartDrawingBase>> = {
        [DrawingToolType.Rectangle]: (chart, series, symbolName, item) => new RectangleDrawing(chart, series, symbolName, item),
        [DrawingToolType.RectangleExtended]: (chart, series, symbolName, item) => new RectangleExtendedDrawing(chart, series, symbolName, item),
        [DrawingToolType.Line]: (chart, series, symbolName, item) => new LineDrawing(chart, series, symbolName, item),
        [DrawingToolType.HorizontalLine]: (chart, series, symbolName, item) => new LineHorizontalDrawing(chart, series, symbolName, item),
        [DrawingToolType.VerticalLine]: (chart, series, symbolName, item) => new LineVerticalDrawing(chart, series, symbolName, item),
        [DrawingToolType.HorizontalLineRay]: (chart, series, symbolName, item) => new LineHorizontalRayDrawing(chart, series, symbolName, item),
        [DrawingToolType.Fibonacci]: (chart, series, symbolName, item) => new FibonacciDrawing(chart, series, symbolName, item),
    };

    private constructor() {
        this._charts = new Map();
        this._drawings = new Map();
        this._listenForChartEvents();
    }

    get drawings(): Map<string, ChartDrawingBase[]> { return this._drawings;}
    get selectedDrawing(): ChartDrawingBase | null { return this._selectedDrawing;}
    get currentChartContainer(): ChartContainer | null { return this._currentChartContainer;}
    get currentDrawingTool(): Tool | null { return this._currentDrawingTool;}
    get creatingNewDrawingFromToolbar(): boolean { return this._creatingNewDrawingFromToolbar;}

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

    public disposeChart(chartContainer: ChartContainer): void {
        document .removeEventListener('keydown', this._onKeyDown);
        chartContainer.dispose();
    }

    public getChart(chartId: string): IChartApi | undefined {
        return this._charts.get(chartId);
    }

    public selectDrawing(drawing: ChartDrawingBase): void {
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
        let data = symbolDrawings.map(drawing => drawing.getBasePropsForLoading()); // get map data
        //console.log("save drawings for ", symbolName, data);
        DataStorage.saveData<ChartDrawingBaseProps[]>(`${symbolName}-drawings`, data); // save drawings for symbol
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
                        chartContainer.addDrawingPrimative(drawing.drawingView as PluginBase);
                    } else {
                        console.warn(`No factory found for drawing type: ${item.type}`);
                    }
                }
            }
        } else {
            console.log("drawings already loaded for chart, just adding primatives ", symbolName);
            const drawings = this._drawings.get(symbolName) || [];
            for (const drawing of drawings) {
                chartContainer.addDrawingPrimative(drawing.drawingView as PluginBase);
            }
        }
    
        console.log("all loaded drawings ", this._drawings);
    }

    public setTextForSelectedDrawing(){
        if(this._selectedDrawing){
            const res = prompt('enter text for selected drawing',this._selectedDrawing.text)
            if(res !== null && res !== undefined){
                this._selectedDrawing.text = res
            }
        }
    }

    // TODO this is messy, can be cleaned up
    public removeDrawingsForCurrentChartSymbol(){
        if(this._currentChartContainer){
            const symbolName = this._currentChartContainer.symbolName
            const drawings = this._drawings.get(symbolName) || [];
            for(const drawing of drawings){
                for(const chart of this._chartContainers.values()){
                    if(chart.symbolName === symbolName)
                        chart.remPrim(drawing.drawingView as PluginBase)
               }
                drawing.remove()
            }
            this._drawings.set(symbolName, []);
            this.saveDrawings(symbolName);
        }
    }

    public removeSelectedDrawing(): void {
       if(!this._selectedDrawing)
            return;

       // remove the actual primative from all charts
       // todo filter by symbol
       //const charts = this._chartContainers.values().filter(o => o.symbolName == this._selectedDrawing?.symbolName)
       for(const chart of this._chartContainers.values()){
            chart.remPrim(this._selectedDrawing.drawingView as PluginBase)
       }

       this._selectedDrawing.remove();
        const drawings = this._drawings.get(this._selectedDrawing.symbolName) || [];
        this._drawings.set(this._selectedDrawing.symbolName, drawings.filter(d => d !== this._selectedDrawing));
        this.saveDrawings(this._selectedDrawing.symbolName);
        this.unselectDrawing();
        document.body.style.cursor = 'default';
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
                this._emitCloseToolbarEvent(this._currentChartContainer.chartId, false);
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
       // if(!tool || !this._currentChartContainer) 
        //    return;
        this._selectedDrawing?.stopDrawing();
        this._creatingNewDrawingFromToolbar = true;
        this._currentDrawingTool = tool;
        this.unselectDrawing();
    }

    public subToolClicked(): void{
        if(this._selectedDrawing){  
            this._selectedDrawing.setBaseStyleOptionsFromConfig();
            if(this._selectedDrawing.isCompleted)
             this.saveDrawings(this._selectedDrawing.symbolName);
        }
    }

    private _addPrimativeToChartContainers(symbolName: string, primative: PluginBase): void {
        const containers = Array.from(this._chartContainers.values()).filter(c => c.symbolName === symbolName);
        for(const container of containers){
            container.addDrawingPrimative(primative);
        }
    }

    // Event Bus Handlers ------------------------------------------------------------  

    private _emitCloseToolbarEvent(chartId: string, closeAll: boolean): void {
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.UnsetToolbar, { detail: {chartId: chartId, closeAll} }));
    }

    private _emitOpenToolbarEvent(chartId: string, toolType: DrawingToolType): void {
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.SetToolbar, { detail: {chartId: chartId, toolType: toolType} }));
    }

    private _listenForChartEvents=()=> {
        eventBus.addEventListener(ChartEvents.NewDrawingCompleted, (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            console.log(`Chart Manager: Chart ${customEvent.detail} has finished rendering.`, this._selectedDrawing);
            if(this._selectedDrawing){ 
                const drawings = this._drawings.get(this._selectedDrawing.symbolName) || [];
                this._drawings.set(this._selectedDrawing.symbolName, [...drawings, this._selectedDrawing]);
                this.saveDrawings(this._selectedDrawing.symbolName);
                this._addPrimativeToChartContainers(this._selectedDrawing.symbolName, this._selectedDrawing.drawingView as PluginBase);
            }
            this._creatingNewDrawingFromToolbar = false;
            this.unselectDrawing();
        });
    }

    // Chart Event Handlers ------------------------------------------------------------

    public onMouseDown(evt: MouseEvent, chartContainer: ChartContainer): void {
        if(evt.button === 2)
            return this.onRightClick(evt, chartContainer)
        else if(evt.button !== 0)
            return

        console.log('onMouseDown', 'chart-drawings-manager',chartContainer.chartId);
        if(!this._selectedDrawing) // only check if a drawing is selected
            return
        
        const p1 = this._selectedDrawing.drawingPoints[0];
        const p2 = this._selectedDrawing.drawingPoints[1];

        this._mouseDownStartPoint = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer); // set original mouse down position
        if(!this._mouseDownStartPoint || !p1 || !p2)
            return

        if(this._selectedDrawing.containsPoint(chartContainer.chart, chartContainer.series, this._mouseDownStartPoint, this._selectedDrawing.drawingPoints)){
            this._isMouseDragging = true;
            this._selectedDrawing.onHoverWhenSelected(this._mouseDownStartPoint); // sets the cursor
            this._setChartDragging(chartContainer.chart, false);
        }

        return
    }

    public onMouseUp(evt: MouseEvent, chartContainer: ChartContainer): void {
        if(evt.button === 2)
            return;

        if(this._isMouseDragging){
            this._selectedDrawing?.setTmpToNewDrawingPoints();
            this.saveDrawings(this._selectedDrawing?.symbolName || '');
        }
        else{
            this.checkCurrentChartContainer(chartContainer);
            const point = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer);

            if(this.creatingNewDrawingFromToolbar){
                if(point){
                    const time : Time | null = chartContainer.chart.timeScale().coordinateToTime(point.x)
                    this._processNewToolbarDrawingOnChartMouseEvent(chartContainer, point ?? undefined, time ?? undefined)
                }
            }
            else if(!this.selectedDrawing || this.selectedDrawing.isCompleted){
                if(point){
                    let drawingFound :boolean= false;
                    console.log('selectedDrawing', this.selectedDrawing);
                    const drawings = this._drawings.get(chartContainer.symbolName) || [];
                    for(const drawing of drawings){
                        if(drawing.containsPoint(chartContainer.chart, chartContainer.series, point, drawing.drawingPoints)){
                            console.log('drawing selected', drawing);
                            this.selectDrawing(drawing);
                            drawing.select();
                            drawingFound = true;
                            //this._updateChartContainerPrimatives(chartContainer.symbolName, [drawing.primative as PluginBase]);
                            break;
                        }
                    }
                    if(!drawingFound){
                        this.unselectDrawing();
                    }
                }
            }
        }
        this._resetMouseDragControls();
    }

    public onMouseMove(param: MouseEventParams): void {
        //console.log('onMouseMove', param.point);
        if((!param.point))
            return;

        this._mousePosition = param.point || null; 

        // if newToolbarDrawing is ImmeidatelyStartDrawing type and has not been initiated
        if(this.creatingNewDrawingFromToolbar && this._currentDrawingTool && this._currentDrawingTool.immediatelyStartDrawing && !this._selectedDrawing && this._currentChartContainer){
            this._processNewToolbarDrawingOnChartMouseEvent(this._currentChartContainer, param.point, param.time)
        }
        else if(this._isMouseDragging && this._mouseDownStartPoint && this._selectedDrawing){
            // move drawing
            this._selectedDrawing.onDrag(param, this._mouseDownStartPoint, param.point);
           // this._selectedDrawing?.updatePosition(this._mouseDownStartPoint, param.point, this._isMouseDragging);
        }
        else if(this._selectedDrawing && this._selectedDrawing.isCompleted){
           this._selectedDrawing.onHoverWhenSelected(param.point); // sets the cursor
        }
    }

    public onRightClick(evt: MouseEvent, chartContainer: ChartContainer): void {
        // TODO we'll need to handle this in the future to open context menu when right clicking, instead of deselecting
        console.log('rclick', 'chart-drawing-manager')
        this.unselectDrawing();
        this.unselectTool();
        this._emitCloseToolbarEvent(chartContainer.chartId, true);

        /*
        if(!this._selectedDrawing || !chartContainer.chart || !chartContainer.series){
            this.unselectTool()
            this._emitCloseToolbarEvent(chartContainer.chartId, true);
            return;
        }

        // Deselect if right click is outside of drawing
        const point = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer);  
        if(point && !containsPoints(chartContainer.chart, chartContainer.series, point, this._selectedDrawing.drawingPoints)){
            this.unselectDrawing();
        }*/
    }

    private _processNewToolbarDrawingOnChartMouseEvent = (chartContainer : ChartContainer, point? : Point, time? : Time) : void =>{
        if(!this.selectedDrawing){ // if start of new drawing
            const drawing =this.currentDrawingTool?.getNewDrawingObject(chartContainer.chart, chartContainer.series, chartContainer.symbolName);
            this.selectDrawing(drawing!);
            console.log('new drawing initiated', drawing, chartContainer.chartId);
        }

        // pass click coordinates to drawing for more processing
        this.selectedDrawing?.onClick(point, time); 
    }

    private _onKeyDown = (evt: KeyboardEvent): void => {
        if (evt.key === 'Delete' || evt.key === 'Backspace') {
            this.removeSelectedDrawing();
        }
    }

    // mouse event hander functions ------------------------------------------------------------

    /*
    private _mouseHoldTimeout =(chart: IChartApi) =>{
        if(this._hasMouseMoved())
            return;
        this._isMouseDragging = true;
        this._setChartDragging(chart, false);
        document.body.style.cursor = 'move';
    }*/

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

    private _resetMouseDragControls(): void {
        this._mouseDownStartPoint = null;
        this._isMouseDragging = false;
        if(this._mouseHoldTimer)
            clearTimeout(this._mouseHoldTimer);

        if(this._currentChartContainer?.chart)
            this._setChartDragging(this._currentChartContainer.chart, true);
    }
}

