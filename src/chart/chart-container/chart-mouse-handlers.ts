import { Point } from 'lightweight-charts';
import type { ChartContainer } from './chart-container';
import { getChartPointFromMouseEvent, mouseEventToMouseEventParamsPointAndTime, MousePointAndTime } from '../../common/points';
import { ChartDrawingsManager } from '../chart-drawings-manager';
import { ChartDrawingBase } from '../drawings/chart-drawing-base';
import { AVAILABLE_TOOLS, DrawingToolType } from '../toolbar/tools/drawing-tools';
import { unselectAllDivsForGroup } from '../../common/utils/html';
import { hasMouseMoved } from '../../common/utils/mouse';

export function initializeListeners(handlers: ReturnType<typeof createChartMouseHandlers>, chartContainer: ChartContainer): void {
    const divContainer = chartContainer.chartDivContainer;

    divContainer.addEventListener('mousemove', handlers.onMouseMove);
    divContainer.addEventListener('mousedown', handlers.onMouseDown);
    divContainer.addEventListener('mousemove', handlers.onMouseMove);
    divContainer.addEventListener('mouseup', handlers.onMouseUp);
    divContainer.addEventListener('contextmenu', handlers.onRightClick);
}

export function removeListeners(handlers: ReturnType<typeof createChartMouseHandlers>, chartContainer: ChartContainer): void {
    const divContainer = chartContainer.chartDivContainer;
  
    divContainer.removeEventListener('mousemove', handlers.onMouseMove);
    divContainer.removeEventListener('mousedown', handlers.onMouseDown);
    divContainer.removeEventListener('mousemove', handlers.onMouseMove);
    divContainer.removeEventListener('mouseup', handlers.onMouseUp);
    divContainer.removeEventListener('contextmenu', handlers.onRightClick);
}

export function createChartMouseHandlers(chartContainer: ChartContainer) {
    const mouseHoldTimeMs = 350;
    let isMouseDragging = false;
    let mouseDownStartPoint: Point | null = null
    let mousePosition: Point | null = null;
    let mouseHoldTimer: NodeJS.Timeout

    return {
        onMouseDown: (evt: MouseEvent) => {
            if (evt.button !== 0) return;
        
            const mgr = chartContainer.chartManager;
            const p1 = mgr.selectedDrawing?.drawingPoints[0];
            const p2 = mgr.selectedDrawing?.drawingPoints[1];
            mouseDownStartPoint = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer);
        
            if (!mgr.selectedDrawing || !mouseDownStartPoint || !p1 || !p2) return;
            if (!mgr.selectedDrawing.containsPoint(chartContainer.chart, chartContainer.series, mouseDownStartPoint, mgr.selectedDrawing.drawingPoints)) return;
        
            isMouseDragging = true;
            chartContainer.setTradingViewChartDraggable(false);
            mouseHoldTimer = _startMouseHoldDetection(mouseHoldTimeMs, mouseDownStartPoint, mgr, mouseHoldTimer);
        },

        onMouseMove: (evt: MouseEvent) => {
            const mgr: ChartDrawingsManager = chartContainer.chartManager;
            const param: MousePointAndTime = mouseEventToMouseEventParamsPointAndTime(evt, chartContainer.chart, chartContainer.chartDivContainer)
            if (!param.time || !param.point) return

            mousePosition = param.point
            
            if(mouseDownStartPoint){
                // checking if mouse has moved while being held
                if(mouseHoldTimer && hasMouseMoved(mousePosition, mouseDownStartPoint)) {
                    clearTimeout(mouseHoldTimer)
                }

                // check if hovering over selected drawing, but not dragging
                if(!isMouseDragging && mgr.selectedDrawing){
                    mgr.selectedDrawing?.onHoverWhenSelected(mouseDownStartPoint); // sets the cursor
                }
            }

            _processOnMouseMove(mgr, param, isMouseDragging, mouseDownStartPoint);

            mgr.switchCurrentContainerIfChanged(chartContainer); // check if hovering over new chart
            mgr.selectedDrawing?.onMouseMove(param); // pass event onto the drawing for processing
        },

        onMouseUp: (evt: MouseEvent) => {
            if (evt.button === 2) return;

            _processOnMouseUp(evt, chartContainer, isMouseDragging)

            // reset mouse drag  properties (no longer dragging on mouseUp)
            chartContainer.chartManager.currentChartContainer?.setTradingViewChartDraggable(true)
            isMouseDragging = false;
            mouseDownStartPoint = null;
        },

        onRightClick: (evt: MouseEvent) => {
            evt.preventDefault();
            _processOnRightClick(chartContainer)
        }
    };
}

function _processOnMouseMove(mgr: ChartDrawingsManager, param: MousePointAndTime, isMouseDragging: boolean, mouseDownStartPoint: Point | null) {
    if (!param || !param.point) return;

    const newToolbarNeedsToBeInitiatedOnFirstChartHoverOver = mgr.creatingNewDrawingFromToolbar && mgr.currentDrawingTool && mgr.currentDrawingTool.immediatelyStartDrawing && !mgr.selectedDrawing && mgr.currentChartContainer
    const isMouseDraggingWithDrawingSelected = (isMouseDragging && mouseDownStartPoint && mgr.selectedDrawing)
    const isDrawingSelected = mgr.selectedDrawing && mgr.selectedDrawing.isCompleted

    if (newToolbarNeedsToBeInitiatedOnFirstChartHoverOver) { // initiate new drawing for some drawing types
        _processNewToolbarDrawingOnChartMouseEvent(mgr.currentChartContainer, param)
    }
    else if (isMouseDraggingWithDrawingSelected) { // move drawing
        mgr.selectedDrawing.onDrag(param, mouseDownStartPoint!, param.point);
    }
    else if (isDrawingSelected) {
        mgr.selectedDrawing.onHoverWhenSelected(param.point); // sets the cursor
    }
}

// cancel all drawing processes
// TODO in the future we open a context window when hovering over drawing
function _processOnRightClick(chartContainer: ChartContainer) {
    const chartManager = chartContainer.chartManager;
    const toolbarManager = chartManager.toolbarManager
    const toolbar = toolbarManager.getToolbar(chartContainer.chartId)

    // dispose subButtons
    if (toolbar && toolbarManager.currentToolType !== DrawingToolType.None) {
        const tool = toolbar.tools.get(toolbarManager.currentToolType)
        tool?.disposeSubButtons();
        toolbarManager.unsetToolbar(chartContainer.chartId);
        unselectAllDivsForGroup(toolbar.toolbarContainer!, AVAILABLE_TOOLS.map(t => t.name));
    }

    // reset drawing values
    toolbarManager.setCurrentToolType(DrawingToolType.None)
    chartManager.unselectDrawing();
    chartManager.unselectTool();
    document.body.style.cursor = 'default';
}

function _processOnMouseUp(evt: MouseEvent, chartContainer: ChartContainer, isMouseDragging: boolean): void {
    const param: MousePointAndTime = mouseEventToMouseEventParamsPointAndTime(evt, chartContainer.chart, chartContainer.chartDivContainer)
    const mgr: ChartDrawingsManager = chartContainer.chartManager;

    if (isMouseDragging) { // mouse dragging
        mgr.selectedDrawing?.setTmpToNewDrawingPoints();
        mgr.saveDrawings(mgr.selectedDrawing?.symbolName || '');
    }
    else if (param.point) { // mouse clicked
        mgr.switchCurrentContainerIfChanged(chartContainer);

        if (mgr.creatingNewDrawingFromToolbar) { 
            _processNewToolbarDrawingOnChartMouseEvent(chartContainer, param)
        }
        else if (!mgr.selectedDrawing || mgr.selectedDrawing.isCompleted) {
            const foundDrawings = _findDrawingsWithinPoint(param.point, chartContainer)
            _processSelectedDrawings(foundDrawings, chartContainer)
        }
    }
}

// TODO we need some algorithm to see which drawing was most likely selected by the user
function _getLikelyUserSelectedDrawing(drawings: ChartDrawingBase[]): ChartDrawingBase {
    return drawings[0];
}

function _processSelectedDrawings(selectedDrawings: ChartDrawingBase[], chartContainer: ChartContainer) {
    const mgr = chartContainer.chartManager;

    if (!selectedDrawings.length) { // no drawings found to be selected
        mgr.unselectDrawing();
    }
    else { // drawing was selected
        const drawing = _getLikelyUserSelectedDrawing(selectedDrawings);
        mgr.setSelectedDrawing(drawing);
        drawing.select(); // set the drawing selected styling
        console.log('drawing selected', drawing);
    }
}

function _processNewToolbarDrawingOnChartMouseEvent(chartContainer: ChartContainer, param: MousePointAndTime): void {
    const mgr = chartContainer.chartManager;

    if (!mgr.selectedDrawing) { // if start of new drawing
        const drawing = mgr.currentDrawingTool?.getNewDrawingObject(chartContainer.chart, chartContainer.series, chartContainer.symbolName);
        mgr.setSelectedDrawing(drawing!);
        console.log('new drawing initiated', drawing, chartContainer.chartId);
    }

    // pass click coordinates to drawing for more processing
    mgr.selectedDrawing?.onClick(param);
}

function _startMouseHoldDetection(
    delay: number,
    startPoint: Point | null,
    mgr: ChartDrawingsManager,
    existingTimer?: NodeJS.Timeout
): NodeJS.Timeout {
    if (existingTimer) clearTimeout(existingTimer);

    return setTimeout(() => {
        if (!startPoint) return;

        mgr.selectedDrawing?.setToMoving();
        clearTimeout(existingTimer)
    }, delay);
}

function _findDrawingsWithinPoint(point: Point, chartContainer: ChartContainer): ChartDrawingBase[] {
    let foundDrawings: ChartDrawingBase[] = []
    const mgr = chartContainer.chartManager;
    const drawings = mgr.drawings.get(chartContainer.symbolName) || [];

    for (const drawing of drawings) {
        if (drawing.containsPoint(chartContainer.chart, chartContainer.series, point, drawing.drawingPoints)) {
            foundDrawings.push(drawing)
        }
    }
    return foundDrawings
}
