import { Point } from 'lightweight-charts';
import type { ChartContainer } from './chart-container';
import { getChartPointFromMouseEvent, mouseEventToMouseEventParamsPointAndTime, MousePointAndTime } from '../../common/points';
import { ChartDrawingsManager } from '../chart-drawings-manager';
import { ChartDrawingBase } from '../drawings/chart-drawing-base';
import { AVAILABLE_TOOLS, DrawingToolType } from '../toolbar/tools/drawing-tools';
import { unselectAllDivsForGroup } from '../../common/utils/html';

//private static readonly MouseHoldTimeMs = 10;
//private static readonly MouseHoldMaxOffsetPoints = 3;

export function initializeListeners(handlers: ReturnType<typeof createChartMouseHandlers>, chartContainer : ChartContainer): void{
  const divContainer = chartContainer.chartDivContainer;

  //chart.subscribeCrosshairMove(this._onCrosshairMoveChartHandler);
  divContainer.addEventListener('mousemove', handlers.onMouseMove);
  divContainer.addEventListener('mousedown', handlers.onMouseDown);
  divContainer.addEventListener('mousemove', handlers.onMouseMove);
  divContainer.addEventListener('mouseup', handlers.onMouseUp);
  divContainer.addEventListener('contextmenu', handlers.onRightClick);
}

export function removeListeners(handlers: ReturnType<typeof createChartMouseHandlers>, chartContainer : ChartContainer): void{
  const divContainer = chartContainer.chartDivContainer;

  //chart.unsubscribeCrosshairMove(this._onCrosshairMoveChartHandler)    
  divContainer.removeEventListener('mousemove', handlers.onMouseMove);
  divContainer.removeEventListener('mousedown', handlers.onMouseDown);
  divContainer.removeEventListener('mousemove', handlers.onMouseMove);
  divContainer.removeEventListener('mouseup', handlers.onMouseUp);
  divContainer.removeEventListener('contextmenu', handlers.onRightClick);
}

export function createChartMouseHandlers(chartContainer: ChartContainer) {
  let isMouseDragging = false;
  let mouseDownStartPoint: Point | null = null
  let mousePosition: Point | null = null;

  return {
    onMouseDown: (evt: MouseEvent) => {
      if(evt.button !== 0) return;

      // get variables
      const mgr : ChartDrawingsManager = chartContainer.chartManager;
      const p1 = mgr.selectedDrawing?.drawingPoints[0];
      const p2 = mgr.selectedDrawing?.drawingPoints[1];
      mouseDownStartPoint = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer); // set original mouse down position

      // validate parameters
      if(!mgr.selectedDrawing) return;// only check if a drawing is selected
      if(!mouseDownStartPoint || !p1 || !p2) return

      // process if clicked over a drawing
      if(mgr.selectedDrawing.containsPoint(chartContainer.chart, chartContainer.series, mouseDownStartPoint, mgr.selectedDrawing.drawingPoints)){
          isMouseDragging = true;
          mgr.selectedDrawing.onHoverWhenSelected(mouseDownStartPoint); // sets the cursor
          chartContainer.setChartDraggable(false);
      }
    },
    onMouseMove: (evt: MouseEvent) => {
      const param: MousePointAndTime = mouseEventToMouseEventParamsPointAndTime(evt, chartContainer.chart, chartContainer.chartDivContainer)
      if(!param.time || !param.point) return

      const mgr : ChartDrawingsManager = chartContainer.chartManager;
      mousePosition = param.point

      _processOnMouseMove(mgr, param, isMouseDragging, mouseDownStartPoint);

      mgr.switchCurrentContainerIfChanged(chartContainer); // check if hovering over new chart
      mgr.selectedDrawing?.onMouseMove(param); // pass event onto the drawing for processing
    },

    onMouseUp: (evt: MouseEvent) => {
      if(evt.button === 2) return;

      _processOnMouseUp(evt, chartContainer, isMouseDragging)

      // reset mouse drag  properties (no longer dragging on mouseUp)
      chartContainer.chartManager.currentChartContainer?.setChartDraggable(true)
      isMouseDragging = false;
      mouseDownStartPoint = null;
    },

    onRightClick: (evt: MouseEvent) =>{
      evt.preventDefault();

      _processOnRightClick(chartContainer)
    }
  };
}

function _processOnMouseMove(mgr : ChartDrawingsManager, param: MousePointAndTime, isMouseDragging: boolean, mouseDownStartPoint: Point | null){
  if(!param || !param.point)
    return;

  const newToolbarNeedsToBeInitiatedOnFirstChartHoverOver = mgr.creatingNewDrawingFromToolbar && mgr.currentDrawingTool && mgr.currentDrawingTool.immediatelyStartDrawing && !mgr.selectedDrawing && mgr.currentChartContainer
  const isMouseDraggingWithDrawingSelected = isMouseDragging && mouseDownStartPoint && mgr.selectedDrawing
  const isDrawingSelected = mgr.selectedDrawing && mgr.selectedDrawing.isCompleted

  if(newToolbarNeedsToBeInitiatedOnFirstChartHoverOver){ // initiate new drawing for some drawing types
      _processNewToolbarDrawingOnChartMouseEvent(mgr.currentChartContainer, param)
  }
  else if(isMouseDraggingWithDrawingSelected){ // move drawing
      mgr.selectedDrawing.onDrag(param, mouseDownStartPoint!, param.point);
     // this._selectedDrawing?.updatePosition(this._mouseDownStartPoint, param.point, this._isMouseDragging);
  }
  else if(isDrawingSelected){ 
     mgr.selectedDrawing.onHoverWhenSelected(param.point); // sets the cursor
  }
}

function _processOnRightClick(chartContainer: ChartContainer){
  	// dispose all  subtools
    // TODO in the future we open a context window when hovering over drawing
    const chartManager = chartContainer.chartManager;
    const toolbarManager = chartManager.toolbarManager
    const toolbar = toolbarManager.getToolbar(chartContainer.chartId)
    if(toolbarManager.currentToolType !== DrawingToolType.None){
      if(toolbar){
        const tool = toolbar.tools.get(toolbarManager.currentToolType)
        tool?.disposeSubButtons();
        toolbarManager.unsetToolbar(chartContainer.chartId);
        unselectAllDivsForGroup(toolbar.toolbarContainer!, AVAILABLE_TOOLS.map(t => t.name));
      }
    }
  
    toolbarManager.setCurrentToolType(DrawingToolType.None)
    chartManager.unselectDrawing();
    chartManager.unselectTool();
    document.body.style.cursor = 'default';
}

function _processOnMouseUp(evt: MouseEvent, chartContainer: ChartContainer, isMouseDragging: boolean): void{
  const param: MousePointAndTime = mouseEventToMouseEventParamsPointAndTime(evt, chartContainer.chart, chartContainer.chartDivContainer)
  const mgr : ChartDrawingsManager = chartContainer.chartManager;

  if(isMouseDragging){ // mouse dragging
      mgr.selectedDrawing?.setTmpToNewDrawingPoints();
      mgr.saveDrawings(mgr.selectedDrawing?.symbolName || '');
  }
  else if(param.point){ // mouse clicked
      mgr.switchCurrentContainerIfChanged(chartContainer);

      if(mgr.creatingNewDrawingFromToolbar){
        _processNewToolbarDrawingOnChartMouseEvent(chartContainer, param)
      }
      else if(!mgr.selectedDrawing || mgr.selectedDrawing.isCompleted){
       const foundDrawings =  _findDrawingsWithinPoint(param.point, chartContainer)
       _processSelectedDrawings(foundDrawings, chartContainer)
      }
  }
}

// TODO we need some algorithm to see which drawing was most likely selected by the user
function _getLikelyUserSelectedDrawing(drawings: ChartDrawingBase[]): ChartDrawingBase{
  return drawings[0];
}

function _processSelectedDrawings(selectedDrawings: ChartDrawingBase[], chartContainer: ChartContainer){
  const mgr = chartContainer.chartManager;
  if(!selectedDrawings.length){ // no drawings found to be selected
    mgr.unselectDrawing();
   }
   else{ // drawing was selected
    const drawing = _getLikelyUserSelectedDrawing(selectedDrawings);
    mgr.setSelectedDrawing(drawing);
    drawing.select(); // set the drawing selected styling
    console.log('drawing selected', drawing);
   }
}

function _findDrawingsWithinPoint(point: Point, chartContainer: ChartContainer): ChartDrawingBase[]{
  let foundDrawings: ChartDrawingBase[] = []
  const mgr = chartContainer.chartManager;
  const drawings = mgr.drawings.get(chartContainer.symbolName) || [];

  for(const drawing of drawings){
    if(drawing.containsPoint(chartContainer.chart, chartContainer.series, point, drawing.drawingPoints)){
        foundDrawings.push(drawing)
    }
  }
  return foundDrawings
}

function _processNewToolbarDrawingOnChartMouseEvent (chartContainer : ChartContainer, param: MousePointAndTime) : void{
  const mgr = chartContainer.chartManager;
  if(!mgr.selectedDrawing){ // if start of new drawing
      const drawing =mgr.currentDrawingTool?.getNewDrawingObject(chartContainer.chart, chartContainer.series, chartContainer.symbolName);
      mgr.setSelectedDrawing(drawing!);
      console.log('new drawing initiated', drawing, chartContainer.chartId);
  }

  // pass click coordinates to drawing for more processing
  mgr.selectedDrawing?.onClick(param); 
}


/*
    private _mouseHoldTimeout =(chart: IChartApi) =>{
        if(this._hasMouseMoved())
            return;
        this._isMouseDragging = true;
        this.setChartDraggable(chart, false);
        document.body.style.cursor = 'move';
    }*/

    // check if mouse is being held, allow for some movement before starting drag (if the mouse jitters due to high dpi)
    /*
  function _hasMouseMoved(): boolean{
    if(!this._mousePosition || !this._mouseDownStartPoint)
        return false;

    // TODO there's a conversion issue since we use MouseEvent for mousedown and MouseEventParams for mousemove, on y
    const yDiff = 0//Math.abs(this._mousePosition.y - this._mouseDownStartPoint.y);
    const xDiff = Math.abs(this._mousePosition.x - this._mouseDownStartPoint.x);
    const offset = 0//ChartDrawingsManager.MouseHoldMaxOffsetPoints;
    return (xDiff > offset || yDiff > offset)
  }*/

/*
private _rightClickHandler=(evt: MouseEvent): void => {
    evt.preventDefault()
    //this._chartManager.onRightClick(evt, this)
}

// mouse down, we want to detect if its dragging
private _onMouseDownChartHandler=(evt: MouseEvent): void => {
    this._chartManager.onMouseDown(evt, this);
}       

private _onMouseUpChartHandler=(evt: MouseEvent): void => {
    this._chartManager.onMouseUp(evt, this);
}

private _onWheelChart=(evt: WheelEvent): void => {
    //console.log('onWheelChart', evt);
}*/