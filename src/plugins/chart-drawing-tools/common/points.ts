import { Coordinate, IChartApi, ISeriesApi, Point, SeriesType, Time } from "lightweight-charts";
import { DrawingPoint } from "./common";

export function getPointFromMouseEvent(evt: MouseEvent): Point | null{
    return  { x: evt.clientX as Coordinate, y: evt.clientY as Coordinate};
}

export function getChartPointFromMouseEvent(evt: MouseEvent, chartDivContainer: HTMLDivElement): Point | null{
    const rect = chartDivContainer.getBoundingClientRect();
    return  { x: evt.clientX - rect.left as Coordinate, y: evt.clientY - rect.top as Coordinate};
}

export function containsPoints(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[], offset: number = 0){
    const len = points.length;
    if(len === 0) return false;
    else if(len === 1) {
        throw new Error("topBottomPoints: 1 points not implemented");
    }
    else if(len === 2){ 
        return _isWithin2Points(chart, series, point, points, offset);
    }
    else{
        return false;
        throw new Error("topBottomPoints: more than 2 points not implemented");
    }
    return false;
}

function _isWithin2Points(chart: IChartApi, series: ISeriesApi<SeriesType>, point: Point, points: DrawingPoint[], offset: number = 0){
    const topBottom = topBottomPoints(points);
    const leftRight = leftRightPoints(points);
    if(!topBottom || !leftRight) return false;
    const top: number = topBottom.top;
    const bottom: number = topBottom.bottom;
    const left: Time = leftRight.left;
    const right: Time = leftRight.right;

    const timeLeft = chart.timeScale().coordinateToTime(point.x - offset);
    const timeRight = chart.timeScale().coordinateToTime(point.x + offset);
    const priceTop = series.coordinateToPrice(point.y + offset);
    const priceBottom = series.coordinateToPrice(point.y - offset);
    if(!timeLeft || !timeRight || !priceTop || !priceBottom) return false;

    return timeLeft >= left && timeRight <= right && priceTop >= bottom && priceBottom <= top;
}

export function topBottomLeftRightPoints(points: DrawingPoint[]) : {top: number, bottom: number, left: Time, right: Time} | null{
    const topBottom = topBottomPoints(points);
    const leftRight = leftRightPoints(points);
    if(!topBottom || !leftRight) return null;
    return {top: topBottom.top, bottom: topBottom.bottom, left: leftRight.left, right: leftRight.right};
}

export function topBottomPoints(points: DrawingPoint[]) : {top: number, bottom: number} | null{
    const len = points.length;
    if(len === 0) return null;
    else if(len === 1) {
        const price = points[0].price;
        return {top: price, bottom: price};
    }
    else if(len === 2){
        let top = points[0].price;
        let bottom = points[1].price;
        if(top > bottom)
            return {top: top, bottom: bottom};
        else
            return {top: bottom, bottom: top};
    }
    else{
        throw new Error("topBottomPoints: more than 2 points no implemented");
    }
}

export function leftRightPoints(points: DrawingPoint[]) : {left: Time, right: Time} | null{
    const len = points.length;
    if(len === 0) return null;
    else if(len === 1){
        const time = points[0].time;
        return {left: time, right: time};
    } 
    else if(len === 2){
        let left = points[0].time;
        let right = points[1].time;
        if(right > left)
            return {left: left, right: right};
        else
        return {left: right, right: left};
    }
    else{
        throw new Error("leftRightPoints: more than 2 points no implemented");
    }
}

//type Time = UTCTimestamp;
export type BoxSide =
  | 'top-left' | 'top' | 'top-right'
  | 'left'     | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'
  | 'inside'
  | null;

export function getBoxHoverTarget(
  chart: IChartApi,
  series: ISeriesApi<SeriesType>,
  p1: DrawingPoint,
  p2: DrawingPoint,
  mouse: Point,
  offset = 3
): BoxSide {
  const timeScale = chart.timeScale();
  const priceScale = series;

  // Convert logical points to pixel coordinates
  const x1 = timeScale.timeToCoordinate(p1.time);
  const x2 = timeScale.timeToCoordinate(p2.time);
  const y1 = priceScale.priceToCoordinate(p1.price);
  const y2 = priceScale.priceToCoordinate(p2.price);

  if (x1 === null || x2 === null || y1 === null || y2 === null) {
    return null;
  }

  // Get bounding box in screen space
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);

  const mx = mouse.x;
  const my = mouse.y;

  // Check corners first
  if (Math.abs(mx - left) <= offset && Math.abs(my - top) <= offset) return 'top-left';
  if (Math.abs(mx - right) <= offset && Math.abs(my - top) <= offset) return 'top-right';
  if (Math.abs(mx - left) <= offset && Math.abs(my - bottom) <= offset) return 'bottom-left';
  if (Math.abs(mx - right) <= offset && Math.abs(my - bottom) <= offset) return 'bottom-right';

  // Check sides
  if (mx >= left && mx <= right) {
    if (Math.abs(my - top) <= offset) return 'top';
    if (Math.abs(my - bottom) <= offset) return 'bottom';
  }
  if (my >= top && my <= bottom) {
    if (Math.abs(mx - left) <= offset) return 'left';
    if (Math.abs(mx - right) <= offset) return 'right';
  }

  // Check inside box
  if (mx >= left && mx <= right && my >= top && my <= bottom) {
    return 'inside';
  }

  return null;
}

/*
export function resizeBoxByHandle(
  p1: DrawingPoint,
  p2: DrawingPoint,
  handle: BoxSide,
  newMousePoint: DrawingPoint
): [DrawingPoint, DrawingPoint] {
  let newP1 = { ...p1 };
  let newP2 = { ...p2 };

  switch (handle) {
    case 'top-left':
      newP1.time = newMousePoint.time;
      newP1.price = newMousePoint.price;
      break;

    case 'top':
      newP1.price = newMousePoint.price;
      break;

    case 'top-right':
      newP2.time = newMousePoint.time;
      newP1.price = newMousePoint.price;
      break;

    case 'left':
      newP1.time = newMousePoint.time;
      break;

    case 'right':
      newP2.time = newMousePoint.time;
      break;

    case 'bottom-left':
      newP1.time = newMousePoint.time;
      newP2.price = newMousePoint.price;
      break;

    case 'bottom':
      newP2.price = newMousePoint.price;
      break;

    case 'bottom-right':
      newP2.time = newMousePoint.time;
      newP2.price = newMousePoint.price;
      break;
  }

  return [newP1, newP2];
}
*/
export function resizeBoxByHandle(
    p1: Point,
    p2: Point,
    handle: BoxSide,
    mouse: Point
  ): [Point, Point] {
    let newP1 = { ...p1 };
    let newP2 = { ...p2 };
  
    switch (handle) {
      case 'top-left':
        newP1.x = mouse.x;
        newP1.y = mouse.y;
        break;
  
      case 'top':
        newP1.y = mouse.y;
        break;
  
      case 'top-right':
        newP2.x = mouse.x;
        newP1.y = mouse.y;
        break;
  
      case 'left':
        newP1.x = mouse.x;
        break;
  
      case 'right':
        newP2.x = mouse.x;
        break;
  
      case 'bottom-left':
        newP1.x = mouse.x;
        newP2.y = mouse.y;
        break;
  
      case 'bottom':
        newP2.y = mouse.y;
        break;
  
      case 'bottom-right':
        newP2.x = mouse.x;
        newP2.y = mouse.y;
        break;
      case 'inside':
        newP1.x = mouse.x;
        newP1.y = mouse.y;
        newP2.x = mouse.x;
        newP2.y = mouse.y;
        break;
    }
  
    return [newP1, newP2];
  }

export function getCursorForBoxSide(side: BoxSide): string {
    switch (side) {
      case 'top-left':
      case 'bottom-right':
        return 'nwse-resize';
      case 'top-right':
      case 'bottom-left':
        return 'nesw-resize';
      case 'top':
      case 'bottom':
        return 'ns-resize';
      case 'left':
      case 'right':
        return 'ew-resize';
      case 'inside':
        return 'move';
      default:
        return 'default';
    }
  }