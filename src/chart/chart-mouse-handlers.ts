import { Point } from 'lightweight-charts';
import type { ChartContainer } from './chart-container';
import { getChartPointFromMouseEvent, mouseEventToMouseEventParamsPointAndTime, MousePointAndTime } from '../common/points';
import { ChartDrawingsManager } from './chart-drawings-manager';

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
      console.log('onMouseDown', 'chart-drawings-manager',chartContainer.chartId);

      if(evt.button !== 0)
        return

      //const param: MousePointAndTime = mouseEventToMouseEventParamsPointAndTime(evt, chartContainer.chart, chartContainer.chartDivContainer)
      const mgr : ChartDrawingsManager = chartContainer.chartManager;

      if(!mgr.selectedDrawing) // only check if a drawing is selected
          return
      
      const p1 = mgr.selectedDrawing.drawingPoints[0];
      const p2 = mgr.selectedDrawing.drawingPoints[1];

      mouseDownStartPoint = getChartPointFromMouseEvent(evt, chartContainer.chartDivContainer); // set original mouse down position
      if(!mouseDownStartPoint || !p1 || !p2)
          return

      if(mgr.selectedDrawing.containsPoint(chartContainer.chart, chartContainer.series, mouseDownStartPoint, mgr.selectedDrawing.drawingPoints)){
          isMouseDragging = true;
          mgr.selectedDrawing.onHoverWhenSelected(mouseDownStartPoint); // sets the cursor
          chartContainer.setChartDragging(false);
      }
    },

    onMouseMove: (evt: MouseEvent) => {
      const param: MousePointAndTime = mouseEventToMouseEventParamsPointAndTime(evt, chartContainer.chart, chartContainer.chartDivContainer)
      const mgr : ChartDrawingsManager = chartContainer.chartManager;
      mousePosition = param.point

      if(!param.time || !param.point)
        return

      // if newToolbarDrawing is ImmeidatelyStartDrawing type and has not been initiated
      if(mgr.creatingNewDrawingFromToolbar && mgr.currentDrawingTool && mgr.currentDrawingTool.immediatelyStartDrawing && !mgr.selectedDrawing && mgr.currentChartContainer){
          _processNewToolbarDrawingOnChartMouseEvent(mgr.currentChartContainer, param)
      }
      else if(isMouseDragging && mouseDownStartPoint && mgr.selectedDrawing){ // move drawing
          mgr.selectedDrawing.onDrag(param, mouseDownStartPoint, param.point);
         // this._selectedDrawing?.updatePosition(this._mouseDownStartPoint, param.point, this._isMouseDragging);
      }
      else if(mgr.selectedDrawing && mgr.selectedDrawing.isCompleted){
         mgr.selectedDrawing.onHoverWhenSelected(param.point); // sets the cursor
      }

      mgr.checkCurrentChartContainer(chartContainer);
      mgr.selectedDrawing?.onMouseMove(param);
    },

    onMouseUp: (evt: MouseEvent) => {
      if(evt.button === 2)
          return;

      const param: MousePointAndTime = mouseEventToMouseEventParamsPointAndTime(evt, chartContainer.chart, chartContainer.chartDivContainer)
      const mgr : ChartDrawingsManager = chartContainer.chartManager;

      if(isMouseDragging){
          mgr.selectedDrawing?.setTmpToNewDrawingPoints();
          mgr.saveDrawings(mgr.selectedDrawing?.symbolName || '');
      }
      else if(param.point){
          mgr.checkCurrentChartContainer(chartContainer);

          if(mgr.creatingNewDrawingFromToolbar){
            _processNewToolbarDrawingOnChartMouseEvent(chartContainer, param)
          }
          else if(!mgr.selectedDrawing || mgr.selectedDrawing.isCompleted){
            let drawingFound :boolean= false;
            console.log('selectedDrawing', mgr.selectedDrawing);
            const drawings = mgr.drawings.get(chartContainer.symbolName) || [];
            for(const drawing of drawings){
                if(drawing.containsPoint(chartContainer.chart, chartContainer.series, param.point, drawing.drawingPoints)){
                    console.log('drawing selected', drawing);
                    mgr.selectDrawing(drawing);
                    drawing.select();
                    drawingFound = true;
                    //this._updateChartContainerPrimatives(chartContainer.symbolName, [drawing.primative as PluginBase]);
                    break;
                }
            }
            if(!drawingFound){
                mgr.unselectDrawing();
            }
          }
      }
      _resetMouseDragControls(chartContainer);
      isMouseDragging = false;
      mouseDownStartPoint = null;
    },
    onRightClick: (evt: MouseEvent) =>{
      evt.preventDefault();
      const mgr = chartContainer.chartManager;
      console.log('rclick', 'chart-drawing-manager')
      mgr.unselectDrawing();
      mgr.unselectTool();
      mgr.closeToolbars(chartContainer.chartId, true);
    }
  };
}

function _processNewToolbarDrawingOnChartMouseEvent (chartContainer : ChartContainer, param: MousePointAndTime) : void{
  const mgr = chartContainer.chartManager;
  if(!mgr.selectedDrawing){ // if start of new drawing
      const drawing =mgr.currentDrawingTool?.getNewDrawingObject(chartContainer.chart, chartContainer.series, chartContainer.symbolName);
      mgr.selectDrawing(drawing!);
      console.log('new drawing initiated', drawing, chartContainer.chartId);
  }

  // pass click coordinates to drawing for more processing
  mgr.selectedDrawing?.onClick(param); 
}

  function _resetMouseDragControls(chartContainer: ChartContainer): void {
    const mgr = chartContainer.chartManager;
    mgr.currentChartContainer?.setChartDragging(true)
    //if(this._mouseHoldTimer)
    //    clearTimeout(this._mouseHoldTimer);
}


/*
    private _mouseHoldTimeout =(chart: IChartApi) =>{
        if(this._hasMouseMoved())
            return;
        this._isMouseDragging = true;
        this._setChartDragging(chart, false);
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