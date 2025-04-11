import { ChartDrawingsManager } from '../chart-drawings-manager.ts';
import { DrawingToolType, AVAILABLE_TOOLS, DrawingToolInfo } from './tools/drawing-tools.ts';
import { clearDiv, selectDivForGroup, unselectAllDivsForGroup } from '../../common/html.ts';
import { ToolLine } from './tools/tool/tool-line.ts';
import { ToolRectangle } from './tools/tool/tool-rectangle.ts';
import { ToolRemove } from './tools/tool/tool-remove.ts';
import Tool from './tools/tool-base.ts';
import { eventBus } from '../../common/common.ts';
import { ChartEvents } from '../../enums/events.ts';
import { ToolRectangleExtended } from './tools/tool/tool-rectangle-extended.ts';
import { ChartDrawingBase } from '../drawings/chart-drawing-base.ts';
import { ToolLineHorizontalRay } from './tools/tool/tool-line-horizontal-ray.ts';
import { ToolLineHorizontal } from './tools/tool/tool-line-horizontal.ts';
import { ToolLineVertical } from './tools/tool/tool-line-vertical.ts';
// This class is the main class for the chart drawing tools.

export class ChartDrawingsToolbar {
	private _drawingsToolbarContainer: HTMLDivElement | undefined;
	private _drawingsSubToolbarContainer: HTMLDivElement | undefined;
	private _chartDrawingsManager: ChartDrawingsManager;
	private _selectedDrawingTool: DrawingToolType = DrawingToolType.None;
	private _removeButton: HTMLDivElement | undefined;
	private _tools: Map<DrawingToolType, Tool> = new Map();
	private _toolFactory: Map<DrawingToolType, new (...args: any[]) => Tool> = new Map();
	private _toolButtons: Map<HTMLDivElement, EventListener> = new Map();
	private _initialized: boolean = false;
	private _chartId: string | undefined;
	constructor(
		chartDrawingsManager: ChartDrawingsManager,
		drawingsToolbarContainer: HTMLDivElement,
		drawingsSubToolbarContainer: HTMLDivElement,
		chartId?: string,
	) {
		this._chartId = chartId;
		this._chartDrawingsManager = chartDrawingsManager;
		this._drawingsToolbarContainer = drawingsToolbarContainer;
		this._drawingsSubToolbarContainer = drawingsSubToolbarContainer;

		this._initializeToolFactory();
		this._initializeToolbar();

		this._initializeMouseEvents();
		this._listenForChartEvents();
	}

	// Expose the event bus so others can listen for chart and drawing events
	get eventBus(): EventTarget {
		return eventBus;
	}

	private _initializeMouseEvents(){
		this._drawingsToolbarContainer?.addEventListener("contextmenu", this._disableRightClick); // we want to change behavior of right click on toolbar
		this._drawingsSubToolbarContainer?.addEventListener("contextmenu", this._disableRightClick); // we want to change behavior of right click on toolbar
	}

	// TODO: dispose should be called when the chart is destroyed
	dispose(){
		this._drawingsToolbarContainer?.removeEventListener("contextmenu", this._disableRightClick);
		this._drawingsSubToolbarContainer?.removeEventListener("contextmenu", this._disableRightClick);
		this._removeButton?.removeEventListener('click', this._onClickRemoveDrawingTool);

		this._removeButton?.removeEventListener('click', this._onClickRemoveDrawingTool);
		eventBus.removeEventListener(ChartEvents.NewDrawingCompleted, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.CompletedDrawingSelected, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.CompletedDrawingUnSelected, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.UnsetToolbar, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.SetToolbarTool, this._listenForChartEvents);
		// todo verify events are being removed
		this._toolButtons.forEach((handler, button) => {
			button.removeEventListener('click', handler);
		});
	
		this._toolButtons.clear();
		this._tools.clear();
	}

	private _initializeToolFactory(){
		this._toolFactory.set(DrawingToolType.Rectangle, ToolRectangle);
		this._toolFactory.set(DrawingToolType.RectangleExtended, ToolRectangleExtended);
		this._toolFactory.set(DrawingToolType.Line, ToolLine);
		this._toolFactory.set(DrawingToolType.HorizontalLineRay, ToolLineHorizontalRay);
		this._toolFactory.set(DrawingToolType.HorizontalLine, ToolLineHorizontal);
		this._toolFactory.set(DrawingToolType.VerticalLine, ToolLineVertical);
		this._toolFactory.set(DrawingToolType.Remove, ToolRemove);
	}

	private _initializeToolbar() {
		if (!this._drawingsToolbarContainer) return;
		
		this._initializeDrawingTools();
		//this._addColorPicker(this._drawingsSubToolbarContainer!);
		//this._initializeSubToolbar();
		this._initialized = true;
	}

	private _initializeDrawingTools(): void {
		if(this._initialized) return; // only initialize once, or we will have multiple listeners on the same button
		AVAILABLE_TOOLS.forEach(tool => {
			const toolClass = this._toolFactory.get(tool.type);
			if(!toolClass || tool.type === DrawingToolType.None) 
				return;

			if(tool.type === DrawingToolType.Remove)
				this._initializeRemoveTool(tool);
			else
				this._initializeStandardTool(tool, toolClass);
		});
	}

	private _initializeRemoveTool(tool: DrawingToolInfo): void {
		const clickHandler = () => this._onClickRemoveDrawingTool();
		const t = new ToolRemove(tool.name, tool.description, tool.icon, tool.type);
		const button = t.setToolbarButton(this._drawingsToolbarContainer!, clickHandler);
		this._tools.set(tool.type, t);
		this._toolButtons.set(button, clickHandler);
	}

	private _initializeStandardTool(tool: DrawingToolInfo, toolClass: new (...args: any[]) => Tool): void {
		const clickHandler = () => this._onClickDrawingTool(tool.type);
		const t = new toolClass(tool.name, tool.description, tool.icon, tool.type);
		const button = t.setToolbarButton(this._drawingsToolbarContainer!, clickHandler);
		this._tools.set(tool.type, t);
		this._toolButtons.set(button, clickHandler);
	}

	private _populateSubToolbar(toolType: DrawingToolType): void {
		clearDiv(this._drawingsSubToolbarContainer!); // clear the sub toolbar
		this._tools.get(toolType)?.setSubToolbarButtons(this._drawingsSubToolbarContainer!); // populate the sub toolbar
	}

	private _startDrawingTool(toolType: DrawingToolType): void {
		this._chartDrawingsManager.startToolDrawing(this._tools.get(toolType)!);
	}

	private _unselectTool(unselectViewOnly? : boolean): void {
		if(!unselectViewOnly){ // truly unselecting, not just changing views between charts
			// dispose all  subtools
			if(this._selectedDrawingTool !== DrawingToolType.None){
				this._tools.get(this._selectedDrawingTool)?.dispose();
			}
			this._selectedDrawingTool = DrawingToolType.None;
			this._chartDrawingsManager.unselectDrawing();
			this._chartDrawingsManager.unselectTool();
			
		}
		document.body.style.cursor = 'default';
		// clear toolbar from view
		unselectAllDivsForGroup(this._drawingsToolbarContainer!, AVAILABLE_TOOLS.map(t => t.name));
		clearDiv(this._drawingsSubToolbarContainer!);
	}

	private _openModifyDrawingToolbar(drawing: ChartDrawingBase): void {
		this._populateSubToolbar(drawing.type)
	}

	private _selectTool(toolType: DrawingToolType): void {
		this._chartDrawingsManager.unselectDrawing();
		unselectAllDivsForGroup(this._drawingsToolbarContainer!, AVAILABLE_TOOLS.map(t => t.name));
		clearDiv(this._drawingsSubToolbarContainer!);

		selectDivForGroup(this._drawingsToolbarContainer!, AVAILABLE_TOOLS.map(t => t.name), toolType);
		this._selectedDrawingTool = toolType;
		this._populateSubToolbar(toolType);
		//alert('selectTool')
		document.body.style.cursor = 'copy';
	}

	// events and listeners ------------------------------------------------------------
	
	private _listenForChartEvents=()=> {
		// new drawing completed, we assume user dont want to add more drawings, deactivate the toolbar
        eventBus.addEventListener(ChartEvents.NewDrawingCompleted, (event: Event) => {
			const customEvent = event as CustomEvent<string>;
			console.log('ChartEvents.NewDrawingCompleted', customEvent.detail)
            this._unselectTool()
        });

		eventBus.addEventListener(ChartEvents.CompletedDrawingSelected, (event: Event) => {
            const customEvent = event as CustomEvent<string>;
			console.log('ChartEvents.NewDrawingCompleted', customEvent.detail)
			const selectedDrawing = this._chartDrawingsManager.selectedDrawing;
            //console.log(`Chart Manager: Chart ${customEvent.detail} modify drawing`, selectedDrawing);
            if(selectedDrawing){  
				this._openModifyDrawingToolbar(selectedDrawing)
            }
        });

		eventBus.addEventListener(ChartEvents.CompletedDrawingUnSelected, (event: Event) => {
            const customEvent = event as CustomEvent<string>;
			console.log('ChartEvents.NewDrawingCompleted', customEvent.detail)
			this._unselectTool(true);
        });

		// request to unset toolbar, remove it from view.  Used while a drawing tool is active, but switching chart
		eventBus.addEventListener(ChartEvents.UnsetToolbar, (event: Event) => {
			const customEvent = event as CustomEvent;  // No type checking here
			const detail = customEvent.detail
			console.log('ChartEvents.UnsetToolbar', detail)
            //if(detail.chartId === this._chartId){
				this._unselectTool(!detail.closeAll);
			//}
        });

		// request to set toolbar for  given chart.  Used when a drawing tool is active, and switching to active chart
		eventBus.addEventListener(ChartEvents.SetToolbarTool, (event: Event) => {
			const customEvent = event as CustomEvent; // No type checking here
			console.log('ChartEvents.SetToolbarTool', customEvent.detail)
            if(customEvent.detail.chartId === this._chartId){
				if(customEvent.detail.toolType !== DrawingToolType.None)
					this._selectTool(customEvent.detail.toolType);
			}
        });
    }

	private _disableRightClick(evt: MouseEvent): void {
		evt.preventDefault();
	}

	// remove/delete drawing
	private _onClickRemoveDrawingTool(): void {
		this._chartDrawingsManager.removeSelectedDrawing();
	}

	// selecting new drawing tool
	// Make sure the clicks bubble up back to here so we can adjust the toolbar
	// An event bus would be cleaner, but we might have a lot of events firing if we have hundreds of charts
	private _onClickDrawingTool(toolType: DrawingToolType): void {
		if(this._selectedDrawingTool === toolType){
			console.log('_onClickDrawingTool', 'same clicked',toolType)
			this._unselectTool();
		}
		else {
			console.log('_onClickDrawingTool', 'new clicked',toolType)
			this._selectTool(toolType);
			this._startDrawingTool(toolType);
		}
	}
}
