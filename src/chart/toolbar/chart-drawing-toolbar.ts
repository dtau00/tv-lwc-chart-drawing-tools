import { ChartDrawingsManager } from '../chart-drawings-manager.ts';
import { DrawingToolType, AVAILABLE_TOOLS } from '../toolbar/tools/drawing-tools.ts';
import { clearDiv, selectDivForGroup, unselectAllDivsForGroup } from '../../common/utils/html.ts';
import { ToolLine } from '../../chart/toolbar/tools/tool/tool-line.ts';
import { ToolRectangle } from '../../chart/toolbar/tools/tool/tool-rectangle.ts';
import { ToolRemove } from '../../chart/toolbar/tools/tool/tool-remove.ts';
import Tool from '../toolbar/tools/tool-base.ts';
import { ButtonEvents, ChartEvents, eventBus, ToolButtonEventDetails } from '../../common/event-bus';
import { ToolRectangleExtended } from '../../chart/toolbar/tools/tool/tool-rectangle-extended.ts';
import { ChartDrawingBase } from '../drawings/chart-drawing-base.ts';
import { ToolLineHorizontalRay } from '../../chart/toolbar/tools/tool/tool-line-horizontal-ray.ts';
import { ToolLineHorizontal } from '../../chart/toolbar/tools/tool/tool-line-horizontal.ts';
import { ToolLineVertical } from '../../chart/toolbar/tools/tool/tool-line-vertical.ts';
import { ToolFibonacci } from '../../chart/toolbar/tools/tool/tool-fibonacci.ts';
import { ToolRemoveAll } from './tools/tool/tool-remove-all.ts';
import { ToolText } from './tools/tool/tool-text.ts';
// This class is the main class for the chart drawing tools.

export class ChartDrawingsToolbar {
	private _toolClickMap: Partial<Record<DrawingToolType, () => void>> = {
		[DrawingToolType.Remove]: () => this._onClickRemoveDrawingTool(),
		[DrawingToolType.RemoveAll]: () => this._onClickRemoveAllDrawingTool(),
		[DrawingToolType.Text]: () => this._onClickTextDrawingTool(),
	};
	private _toolFactory =  new Map([
		[DrawingToolType.Fibonacci, ToolFibonacci],
		[DrawingToolType.Rectangle, ToolRectangle],
		[DrawingToolType.RectangleExtended, ToolRectangleExtended],
		[DrawingToolType.Line, ToolLine],
		[DrawingToolType.HorizontalLineRay, ToolLineHorizontalRay],
		[DrawingToolType.HorizontalLine, ToolLineHorizontal],
		[DrawingToolType.VerticalLine, ToolLineVertical],
		[DrawingToolType.Text, ToolText],
		[DrawingToolType.Remove, ToolRemove],
		[DrawingToolType.RemoveAll, ToolRemoveAll],
	]);
	private _toolMap = {
		[DrawingToolType.Remove]: ToolRemove,
		[DrawingToolType.RemoveAll]: ToolRemoveAll,
		[DrawingToolType.Text]: ToolText,
	};
	private _drawingsToolbarContainer: HTMLDivElement | undefined;
	private _drawingsSubToolbarContainer: HTMLDivElement | undefined;
	private _chartDrawingsManager: ChartDrawingsManager;
	private _selectedDrawingTool: DrawingToolType = DrawingToolType.None;
	private _removeButton: HTMLDivElement | undefined;
	private _tools: Map<DrawingToolType, Tool> = new Map();
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

		this._initializeToolbar();
		this._initializeMouseEvents();
		this._listenForChartEvents();
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

		eventBus.removeEventListener(ChartEvents.NewDrawingCompleted, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.CompletedDrawingSelected, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.CompletedDrawingUnSelected, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.UnsetToolbar, this._listenForChartEvents);
		eventBus.removeEventListener(ChartEvents.SetToolbar, this._listenForChartEvents);
		eventBus.removeEventListener(ButtonEvents.ToolClicked, this._listenForChartEvents);
		eventBus.removeEventListener(ButtonEvents.SubToolClicked, this._listenForChartEvents);
		
		// todo verify events are being removed
		this._toolButtons.forEach((handler, button) => {
			button.removeEventListener('click', handler);
		});
	
		this._toolButtons.clear();
		this._tools.clear();
	}

	private _toolClicked(toolType: DrawingToolType){
		// get from toolMap, or default
		const click = this._toolClickMap[toolType] ?? (() => this._onClickDrawingTool(toolType));
		click();
	}

	private _initializeToolbar() {
		if (!this._drawingsToolbarContainer) return;
		
		this._initializeDrawingTools();
		this._initialized = true;
	}

	private _initializeDrawingTools(): void {
		if(this._initialized) return; // only initialize once, or we will have multiple listeners on the same button
		AVAILABLE_TOOLS.forEach(tool => {
			const toolClass = this._toolFactory.get(tool.type);
			if(!toolClass || tool.type === DrawingToolType.None) 
				return;

			const ToolClass = this._toolMap[tool.type] ?? toolClass;
			const t = new ToolClass(tool.name, tool.description, tool.icon, tool.type);
			t.addToolButtonToContainer(this._drawingsToolbarContainer!);
			this._tools.set(tool.type, t);
		});
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
				this._tools.get(this._selectedDrawingTool)?.disposeSubButtons();
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
			console.log('ChartEvents.CompletedDrawingSelected', customEvent.detail)
			const selectedDrawing = this._chartDrawingsManager.selectedDrawing;
            //console.log(`Chart Manager: Chart ${customEvent.detail} modify drawing`, selectedDrawing);
            if(selectedDrawing){  
				this._openModifyDrawingToolbar(selectedDrawing)
            }
        });

		eventBus.addEventListener(ChartEvents.CompletedDrawingUnSelected, (event: Event) => {
            const customEvent = event as CustomEvent<string>;
			console.log('ChartEvents.CompletedDrawingUnSelected', customEvent.detail)
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
		eventBus.addEventListener(ChartEvents.SetToolbar, (event: Event) => {
			const customEvent = event as CustomEvent; // No type checking here
			console.log('ChartEvents.SetToolbarTool', customEvent.detail)
            if(customEvent.detail.chartId === this._chartId){
				if(customEvent.detail.toolType !== DrawingToolType.None)
					this._selectTool(customEvent.detail.toolType);
			}
        });

		eventBus.addEventListener(ButtonEvents.ToolClicked, (event: Event) => {
			const details = (event as CustomEvent).detail as ToolButtonEventDetails; 
			this._toolClicked(details.toolType);
		});

		eventBus.addEventListener(ButtonEvents.SubToolClicked, (event: Event) => {
			const details = (event as CustomEvent).detail as ToolButtonEventDetails; 
			this._chartDrawingsManager.subToolClicked();
		});
    }

	private _disableRightClick(evt: MouseEvent): void {
		evt.preventDefault();
	}

	// remove/delete drawing
	private _onClickRemoveDrawingTool(): void {
		this._chartDrawingsManager.removeSelectedDrawing();
	}

	// remove/delete drawing
	private _onClickRemoveAllDrawingTool(): void {
		if(confirm('Are you sure you want to remove all drawings from this symbol?')){
			this._chartDrawingsManager.removeDrawingsForCurrentChartSymbol();
			this._chartDrawingsManager.removeSelectedDrawing();
		}
	}

	private _onClickTextDrawingTool(): void {
		this._chartDrawingsManager.setTextForSelectedDrawing();
	}


	// selecting new drawing tool
	// Make sure the clicks bubble up back to here so we can adjust the toolbar
	// An event bus would be cleaner, but we might have a lot of events firing if we have hundreds of charts
	private _onClickDrawingTool(toolType: DrawingToolType): void {
		if(this._selectedDrawingTool === toolType){
			console.log('_onClickDrawingTool', 'same tool clicked',toolType)
			this._unselectTool();
		}
		else {
			console.log('_onClickDrawingTool', 'new tool clicked',toolType)
			this._selectTool(toolType);
			this._startDrawingTool(toolType);
		}
	}
}
