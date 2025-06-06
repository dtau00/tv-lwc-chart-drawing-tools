import { ChartDrawingsManager } from "../chart-drawings-manager";
import { eventBus, DrawingEvents, ButtonEvents, ToolButtonEventDetails, DrawingEventDetails } from "../../common/event-bus";
import { ChartDrawingBase } from "../drawings/chart-drawing-base";
import { AVAILABLE_TOOLS, DrawingToolType } from "./tools/drawing-tools";
import { clearDiv, selectDivForGroup, unselectAllDivsForGroup } from "../../common/utils/html";
import { ChartDrawingsToolbar } from "./chart-drawing-toolbar";

const NonDrawingToolClickMap: Partial<Record<DrawingToolType, () => void>> = {
	[DrawingToolType.Remove]: () => _onClickRemoveDrawingTool(ChartDrawingsManager.getInstance()),
	[DrawingToolType.RemoveAll]: () => _onClickRemoveAllDrawingTool(ChartDrawingsManager.getInstance()),
	[DrawingToolType.Text]: () => _onClickTextDrawingTool(ChartDrawingsManager.getInstance()),
};

// The bus is an extension of the ChartManager, and coordinates the ChartManager, ToolBarManager, and ChartContainers
// listens on the event bus for toolbar actions
// we dont need to worry about disposing these since they are tied to the chart manager are long lived
export function initializeEventBus(chartManager: ChartDrawingsManager){
	// New Drawing Completed
    eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, (event: Event) => {
        const details = (event as CustomEvent).detail as DrawingEventDetails; 
		console.log('DrawingEvents.NewDrawingCompleted', details)
		const selectedDrawing = chartManager.selectedDrawing
		if(!selectedDrawing) return;

		_processNewDrawing(selectedDrawing, chartManager);
		_resetToolbars(chartManager)
    });

	// Drawing Selected
	eventBus.addEventListener(DrawingEvents.CompletedDrawingSelected, (event: Event) => {
        const details = (event as CustomEvent).detail as DrawingEventDetails; 
		const selectedDrawing = chartManager.selectedDrawing
		console.log('DrawingEvents.CompletedDrawingSelected', details)
		if(!selectedDrawing) return;

		_activateToolbar(chartManager, selectedDrawing.toolType)
	});

	// Drawing Unselected
	eventBus.addEventListener(DrawingEvents.CompletedDrawingUnSelected, (event: Event) => {
        const details = (event as CustomEvent).detail as DrawingEventDetails; 
		const currentChartContainer = chartManager.currentChartContainer
		console.log('DrawingEvents.CompletedDrawingUnSelected', details)
		if(!currentChartContainer) return;

		const toolbarId = currentChartContainer.chartId
		_unselectTool(chartManager, toolbarId);
		_removeSubToolFromView(chartManager)
	});

	// Tool Button Clicked
	eventBus.addEventListener(ButtonEvents.ToolClicked, (event: Event) => {
        const details = (event as CustomEvent).detail as ToolButtonEventDetails; 
		console.log('DrawingEvents.ToolClicked', details)

        _toolClicked(details.toolType, details.toolbarId, chartManager);
    });

	// Sub Tool Button Clicked
    eventBus.addEventListener(ButtonEvents.SubToolClicked, (event: Event) => {
        const details = (event as CustomEvent).detail as ToolButtonEventDetails; 
		console.log('DrawingEvents.ToolClicked', details)

        _applyAndSaveCurrentStylingToSelectedDrawing(chartManager);
    });
}

function _activateToolbar(chartManager: ChartDrawingsManager, toolType: DrawingToolType){
	const chartId = chartManager.currentChartContainer?.chartId
	if(!chartId) return;
	
	chartManager.toolbarManager.getToolbar(chartId)?.activateTool(toolType)
}

// process new drawing.  add to list, draw on other containers, save
function _processNewDrawing(selectedDrawing: ChartDrawingBase, chartManager: ChartDrawingsManager){
	if(!selectedDrawing) return;

	const drawings = chartManager.drawings.get(selectedDrawing.symbolName) || [];
	chartManager.drawings.set(selectedDrawing.symbolName, [...drawings, selectedDrawing]);
	chartManager.saveDrawings(selectedDrawing.symbolName);
	_addDrawingToChartContainers(selectedDrawing.symbolName, selectedDrawing, chartManager);
}

// reset the toolbar drawing process
function _resetToolbars(chartManager: ChartDrawingsManager){
	const currentChartContainer = chartManager.currentChartContainer
	if(!currentChartContainer) return;

	const toolbarId = chartManager.currentChartContainer.chartId
	_unselectTool(chartManager, toolbarId);
	chartManager.creatingNewDrawingFromToolbar = false;
	chartManager.unselectDrawing();
}

function _applyAndSaveCurrentStylingToSelectedDrawing(chartManager: ChartDrawingsManager){
	const selectedDrawing = chartManager.selectedDrawing
	if(!selectedDrawing) return;

	selectedDrawing.setBaseStyleOptionsFromConfig();
	if(selectedDrawing.isCompleted)
		chartManager.saveDrawings(selectedDrawing.symbolName);
}

function _addDrawingToChartContainers(symbolName: string, chartDrawing: ChartDrawingBase, chartManager: ChartDrawingsManager): void {
    const containers = chartManager.getChartContainersForSymbol(symbolName)
    for(const container of containers){
        if(container.chartId !== chartManager.currentChartContainer?.chartId)
            container.setChartDrawingPrimative(chartDrawing)
    }
}

function _toolClicked(toolType: DrawingToolType, toolbarId: string, chartManager: ChartDrawingsManager){
	// Get from toolMap, or default as drawing tool
	const click = NonDrawingToolClickMap[toolType] ?? (() => _onClickDrawingTool(toolType, toolbarId, chartManager));
	click();
}

function _onClickDrawingTool(toolType: DrawingToolType, toolbarId: string, chartManager: ChartDrawingsManager): void {
	const toolbarManager = chartManager.toolbarManager

	if(toolbarManager.currentToolType === toolType){ // unselect if same tool clicked
		console.log('_onClickDrawingTool', 'same tool clicked, unselecting',toolType)
		_unselectTool(chartManager, toolbarId);
		chartManager.unselectDrawing();
	}
	else { // change tools on new tool clicked
		console.log('_onClickDrawingTool', 'new tool clicked',toolType)
		toolbarManager.setCurrentToolType(toolType)
		_selectTool(toolType,  toolbarId, chartManager);
	}
}

// remove/delete drawing
function _onClickRemoveDrawingTool(chartManager: ChartDrawingsManager): void {
	chartManager.deleteSelectedDrawing();
	_removeSubToolFromView(chartManager);
}

// remove/delete drawing
function _onClickRemoveAllDrawingTool(chartManager: ChartDrawingsManager): void {
	if(confirm('Are you sure you want to remove all drawings from this symbol?')){
		chartManager.removeDrawingsForCurrentChartSymbol();
		chartManager.deleteSelectedDrawing();
		_removeSubToolFromView(chartManager);
		_resetToolbars(chartManager)
	}
}

function _onClickTextDrawingTool(chartManager: ChartDrawingsManager): void {
	if(!chartManager.selectedDrawing){
		alert('select a drawing before you can change its text')
	}
	else{
		_setTextForSelectedDrawing(chartManager);
	}
}

function _setTextForSelectedDrawing(chartManager: ChartDrawingsManager): void {
	const selected = chartManager.selectedDrawing;
	if (!selected) return;

	const input = prompt(`Enter text for selected ${selected.symbolName} drawing`, selected.text);
	if (input != null) {
		selected.text = input;
	}
}

function _unselectTool(chartManager: ChartDrawingsManager, toolbarId: string): void {
	const toolbarManager = chartManager.toolbarManager

	_disposeSubToolButtons(toolbarId, chartManager);

	//chartManager.unselectDrawing(); // this can cause an infinite loop
	toolbarManager.setCurrentToolType(DrawingToolType.None)
	chartManager.unselectTool();
	document.body.style.cursor = 'default';
}

function _selectTool(toolType: DrawingToolType, toolbarId: string, chartManager: ChartDrawingsManager): void {
	const toolbarManager = chartManager.toolbarManager;
	const toolbar = toolbarManager.getToolbar(toolbarId)
	if(!toolbar) return;

	_disposeSubToolButtons(toolbarId, chartManager);

	//chartManager.unselectDrawing();
	_selectToolDivForGroup(toolbar, toolType);
	toolbarManager.setCurrentToolType(toolType);
	toolbar.activateTool(toolType);
	chartManager.startNewDrawing(toolbar.currentTool!);
	document.body.style.cursor = 'copy';
}

function _disposeSubToolButtons(toolbarId: string, chartManager: ChartDrawingsManager){
	const toolbarManager = chartManager.toolbarManager
	const toolbar = toolbarManager.getToolbar(toolbarId)
	if(!toolbar) return;

	// dispose all  subtools
	const tool = toolbar.tools.get(toolbarManager.currentToolType)
	tool?.disposeSubButtons();
	_removeSubToolFromView(chartManager)
}

// TODO is there an issue with not releasing 
function _removeSubToolFromView(chartManager?: ChartDrawingsManager){
	if(!chartManager) return;
	
	const chartId = chartManager.currentChartContainer?.chartId
	if(!chartId) return;

	const toolbar = chartManager.toolbarManager.getToolbar(chartId)
	if(!toolbar) return;

	unselectAllDivsForGroup(toolbar.toolbarContainer!, AVAILABLE_TOOLS.map(t => t.name));
	clearDiv(toolbar.subToolbarContainer!);
}

function _selectToolDivForGroup(toolbar: ChartDrawingsToolbar, toolType: DrawingToolType){
	selectDivForGroup(toolbar.toolbarContainer!, AVAILABLE_TOOLS.map(t => t.name), toolType);
}
