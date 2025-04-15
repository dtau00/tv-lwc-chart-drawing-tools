import { ChartDrawingsManager } from "../chart-drawings-manager";
import { eventBus, DrawingEvents, ButtonEvents, ToolButtonEventDetails } from "../../common/event-bus";
import { ChartDrawingBase } from "../drawings/chart-drawing-base";
import { AVAILABLE_TOOLS, DrawingToolType } from "./tools/drawing-tools";
import { clearDiv, selectDivForGroup, unselectAllDivsForGroup } from "../../common/utils/html";
import { ChartDrawingsToolbar } from "./chart-drawing-toolbar";

const ToolClickMap: Partial<Record<DrawingToolType, () => void>> = {
	[DrawingToolType.Remove]: () => _onClickRemoveDrawingTool(ChartDrawingsManager.getInstance()),
	[DrawingToolType.RemoveAll]: () => _onClickRemoveAllDrawingTool(ChartDrawingsManager.getInstance()),
	[DrawingToolType.Text]: () => _onClickTextDrawingTool(ChartDrawingsManager.getInstance()),
};

// The bus is an extension of the ChartManager, and coordinates the ChartManager, ToolBarManager, and ChartContainers
// listens on the event bus for toolbar actions
export function initializeEventBus(chartManager: ChartDrawingsManager){
	
    eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, (event: Event) => {
        const customEvent = event as CustomEvent<string>;
		const selectedDrawing = chartManager.selectedDrawing;

        console.log(`Chart Manager: Chart ${customEvent.detail} has finished rendering.`, selectedDrawing);
        if(selectedDrawing){ 
            const drawings = chartManager.drawings.get(selectedDrawing.symbolName) || [];
            chartManager.drawings.set(selectedDrawing.symbolName, [...drawings, selectedDrawing]);
            chartManager.saveDrawings(selectedDrawing.symbolName);
            _addDrawingToChartContainers(selectedDrawing.symbolName, selectedDrawing, chartManager);
        }
		const toolbarId = chartManager.currentChartContainer?.chartId ?? ''
		_unselectTool(chartManager, toolbarId);
        chartManager.creatingNewDrawingFromToolbar = false;
        chartManager.unselectDrawing();
    });

	eventBus.addEventListener(DrawingEvents.CompletedDrawingSelected, (event: Event) => {
		const customEvent = event as CustomEvent<string>;
		console.log('DrawingEvents.CompletedDrawingSelected', customEvent.detail)
		const selectedDrawing = chartManager.selectedDrawing;
		//console.log(`Chart Manager: Chart ${customEvent.detail} modify drawing`, selectedDrawing);
		if(selectedDrawing){  
			const chartId = chartManager.currentChartContainer?.chartId
			if(chartId){
				const toolBar = chartManager.toolbarManager.getToolbar(chartId)?.activateTool(selectedDrawing.toolType)
				//this.openModifyDrawingToolbar(selectedDrawing)
			}
		}
	});

	eventBus.addEventListener(DrawingEvents.CompletedDrawingUnSelected, (event: Event) => {
		const customEvent = event as CustomEvent<string>;
		console.log('DrawingEvents.CompletedDrawingUnSelected', customEvent.detail)
		const toolbarId = chartManager.currentChartContainer?.chartId ?? ''
		_unselectTool(chartManager, toolbarId);
	});

	eventBus.addEventListener(ButtonEvents.ToolClicked, (event: Event) => {
		console.log('tool clicked')
        const details = (event as CustomEvent).detail as ToolButtonEventDetails; 
        _toolClicked(details.toolType, details.toolbarId, chartManager);
    });

    eventBus.addEventListener(ButtonEvents.SubToolClicked, (event: Event) => {
        const details = (event as CustomEvent).detail as ToolButtonEventDetails; 
        _applyAndSaveCurrentStylingToSelectedDrawing(chartManager);
    });
}

function _applyAndSaveCurrentStylingToSelectedDrawing(chartManager: ChartDrawingsManager){
	const selectedDrawing = chartManager.selectedDrawing
	if(selectedDrawing){  
		selectedDrawing.setBaseStyleOptionsFromConfig();
		if(selectedDrawing.isCompleted)
		 chartManager.saveDrawings(selectedDrawing.symbolName);
	}
}

function _addDrawingToChartContainers(symbolName: string, chartDrawing: ChartDrawingBase, chartManager: ChartDrawingsManager): void {
    const containers = chartManager.getChartContainersForSymbol(symbolName)
    for(const container of containers){
        if(container.chartId !== chartManager.currentChartContainer?.chartId)
            container.setChartDrawing(chartDrawing)
    }
}

function _toolClicked(toolType: DrawingToolType, toolbarId: string, chartManager: ChartDrawingsManager){
	// get from toolMap, or default
	const click = ToolClickMap[toolType] ?? (() => _onClickDrawingTool(toolType, toolbarId, chartManager));
	click();
}

function _onClickDrawingTool(toolType: DrawingToolType, toolbarId: string, chartManager: ChartDrawingsManager): void {
	const toolbarManager = chartManager.toolbarManager
	console.log(toolbarManager.currentToolType, toolType)
	if(toolbarManager.currentToolType === toolType){
		console.log('_onClickDrawingTool', 'same tool clicked, unselecting',toolType)
		_unselectTool(chartManager, toolbarId);
		chartManager.unselectDrawing();
	}
	else {
		toolbarManager.setCurrentToolType(toolType)
		console.log('_onClickDrawingTool', 'new tool clicked',toolType)
		_selectTool(toolType,  toolbarId, chartManager);
	}
}

// remove/delete drawing
function _onClickRemoveDrawingTool(chartManager: ChartDrawingsManager): void {
	chartManager.removeSelectedDrawing();
}

// remove/delete drawing
function _onClickRemoveAllDrawingTool(chartManager: ChartDrawingsManager): void {
	if(confirm('Are you sure you want to remove all drawings from this symbol?')){
		chartManager.removeDrawingsForCurrentChartSymbol();
		chartManager.removeSelectedDrawing();
	}
}

function _onClickTextDrawingTool(chartManager: ChartDrawingsManager): void {
	_setTextForSelectedDrawing(chartManager);
}

function _setTextForSelectedDrawing(chartManager: ChartDrawingsManager): void {
	const selected = chartManager.selectedDrawing;
	if (!selected) return;

	const input = prompt(`Enter text for selected ${selected.symbolName} drawing`, selected.text);
	if (input != null) {
		selected.text = input;
	}
}

// TODO is there an issue with not releasing 
function _removeSubToolFromView(toolbar: ChartDrawingsToolbar){
	unselectAllDivsForGroup(toolbar.toolbarContainer!, AVAILABLE_TOOLS.map(t => t.name));
	clearDiv(toolbar.subToolbarContainer!);
}

function _unselectTool(chartManager: ChartDrawingsManager, toolbarId: string): void {
	// dispose all  subtools
	const toolbarManager = chartManager.toolbarManager
	const toolbar = toolbarManager.getToolbar(toolbarId)
	if(toolbarManager.currentToolType !== DrawingToolType.None){
		if(toolbar){
			const tool = toolbar.tools.get(toolbarManager.currentToolType)
			tool?.disposeSubButtons();
			_removeSubToolFromView(toolbar)
		}
	}

	toolbarManager.setCurrentToolType(DrawingToolType.None)
	//chartManager.unselectDrawing();
	chartManager.unselectTool();
	document.body.style.cursor = 'default';
}

function _selectTool(toolType: DrawingToolType, toolbarId: string, chartManager: ChartDrawingsManager): void {
	const toolbarManager = chartManager.toolbarManager;
	const toolbar = toolbarManager.getToolbar(toolbarId)
	if(!toolbar) return;

	chartManager.unselectDrawing();
	unselectAllDivsForGroup(toolbar.toolbarContainer!, AVAILABLE_TOOLS.map(t => t.name));
	clearDiv(toolbar.subToolbarContainer!);

	selectDivForGroup(toolbar.toolbarContainer!, AVAILABLE_TOOLS.map(t => t.name), toolType);
	toolbarManager.setCurrentToolType(toolType);
	toolbar.activateTool(toolType);
	chartManager.startNewDrawing(toolbar.currentTool!);
	document.body.style.cursor = 'copy';
}
