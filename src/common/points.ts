import { Coordinate, IChartApi, ISeriesApi, Point, SeriesType, Time } from "lightweight-charts";
import { coordinateToTimeMax, timeToCoordinateMax } from "./utils/time";
import { ChartDrawingBase } from "../chart/drawings/chart-drawing-base";
import { ChartContainer } from "../chart/chart-container/chart-container";

export interface DrawingPoint {
	time: Time;
	price: number;
}

export interface ViewPoint {
	x: Coordinate | null;
	y: Coordinate | null;
}

export interface MousePointAndTime{
  point: Point | null;
  time: Time | null;
}


export function getPointFromMouseEvent(evt: MouseEvent): Point | null{
    return  { x: evt.clientX as Coordinate, y: evt.clientY as Coordinate};
}

export function getChartPointFromMouseEvent(evt: MouseEvent, chartDivContainer: HTMLDivElement): Point | null{
    const rect = chartDivContainer.getBoundingClientRect();
    return  { x: evt.clientX - rect.left as Coordinate, y: evt.clientY - rect.top as Coordinate};
}

export function mouseEventToMouseEventParamsPointAndTime(evt: MouseEvent, chart: IChartApi, chartDivContainer: HTMLDivElement): MousePointAndTime{
  const point = getChartPointFromMouseEvent(evt, chartDivContainer)
  if(point){
    const time = chart.timeScale().coordinateToTime(point.x)
    return {point, time} as MousePointAndTime
  }
  return { point: null, time: null }
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

export function isPointNearLine(
	chart: IChartApi,
	series: ISeriesApi<SeriesType>,
	point: Point,
	points: DrawingPoint[],
	offset: number = 5
): boolean {
	if (points.length !== 2) return false;

	const [p1, p2] = points;
	const price1 = series.priceToCoordinate(p1.price);
	const price2 = series.priceToCoordinate(p2.price);
	const timeScale = chart.timeScale();
	const x1 = timeToCoordinateMax(p1.time, chart);
	const x2 = timeToCoordinateMax(p2.time, chart);

	if (x1 === null || x2 === null || price1 === null || price2 === null) return false;

	const lineStart = { x: x1, y: price1 };
	const lineEnd = { x: x2, y: price2 };

	// Distance from point to line segment
	const dx = lineEnd.x - lineStart.x;
	const dy = lineEnd.y - lineStart.y;
	const lengthSq = dx * dx + dy * dy;

	if (lengthSq === 0) {
		// line is a point
		const distSq = (point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2;
		return distSq <= offset * offset;
	}

	let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSq;
	t = Math.max(0, Math.min(1, t));

	const closestX = lineStart.x + t * dx;
	const closestY = lineStart.y + t * dy;

	const distSq = (point.x - closestX) ** 2 + (point.y - closestY) ** 2;

	return distSq <= offset * offset;
}

export function isPointOverStraightLineDrawing(
	p: Point,
	drawingPoints: DrawingPoint[],
	chart: IChartApi,
	series: ISeriesApi<SeriesType>,
	offset: number = 4
): boolean {
  const x = p.x
  const y = p.y
  const dp1 = drawingPoints[0]
  const dp2 = drawingPoints[1]

	const x1 = timeToCoordinateMax(dp1.time, chart);
	const x2 = timeToCoordinateMax(dp2.time, chart);
	const y1 = series.priceToCoordinate(dp1.price);
	const y2 = series.priceToCoordinate(dp2.price);

	if (x1 == null || x2 == null || y1 == null || y2 == null) return false;

  const leftX = (x1 < x2 ? x1 : x2) - offset
  const rightX = (x1 > x2 ? x1 : x2) + offset
  const bottomY = (y1 > y2 ? y1 : y2) + offset
  const topY = (y1 < y2 ? y1 : y2) - offset

  console.log(x, y, leftX, rightX, topY, bottomY)

  return (x >= leftX && x <= rightX && y <= topY && y <= bottomY)
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
  offset = 3,
  ignoreInside: boolean = false
): BoxSide {
  const timeScale = chart.timeScale();
  const priceScale = series;

  // Convert logical points to pixel coordinates
  //const x1 = timeScale.timeToCoordinate(p1.time);
  //const x2 = timeScale.timeToCoordinate(p2.time);
  const x1 = timeToCoordinateMax(p1.time, chart);
  const x2 = timeToCoordinateMax(p2.time, chart);
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
  if (!ignoreInside && mx >= left && mx <= right && my >= top && my <= bottom) {
    return 'inside';
  }

  return null;
}

export function pointToDrawingPoints(p : Point, chart: IChartApi, series: ISeriesApi<SeriesType>) : DrawingPoint{
  return {
    //time: chart.timeScale().coordinateToTime(p.x)!, 
    time: coordinateToTimeMax(p.x, chart),
    price: series.coordinateToPrice(p.y)!
  } as DrawingPoint
}

export function drawingPointToPoint(drawingPoint : DrawingPoint, chart: IChartApi, series: ISeriesApi<SeriesType>) : Point{
  return { 
    //x : chart.timeScale().timeToCoordinate(drawingPoint.time),
    x : timeToCoordinateMax(drawingPoint.time, chart),
    y  : series.priceToCoordinate(drawingPoint.price)
  } as Point
}

export function convertAndNormalizeDrawingPointsToPoint(dp1 : DrawingPoint, dp2 : DrawingPoint, chart: IChartApi, series: ISeriesApi<SeriesType>) : [Point, Point]{
  let p1 = drawingPointToPoint(dp1, chart, series)
  let p2 = drawingPointToPoint(dp2, chart, series)

  // normalize
  if(p1.x > p2.x){
    const tmp = p1;
    p1 = p2;
    p2 = tmp;
  }

  return [p1, p2]
}

export function  offsetPoints(startPoint : Point, endPoint : Point, point1 : Point, point2 : Point) : [Point, Point]{
  const xOffset = endPoint.x - startPoint.x;
  const yOffset = endPoint.y - startPoint.y;

  let p1 = {...point1}
  let p2 = {...point2}
  
    p1.x = (p1.x + xOffset) as Coordinate;
    p2.x = (p2.x + xOffset) as Coordinate;
    p1.y = (p1.y + yOffset) as Coordinate;
    p2.y = (p2.y + yOffset) as Coordinate;

    return [p1, p2]
}

export function getUpdateBoxPosition(startPoint: Point, endPoint: Point, drawingPoints1 : DrawingPoint, drawingPoints2 : DrawingPoint, side: BoxSide, chart : IChartApi, series :  ISeriesApi<SeriesType>, extend : boolean) : [Point, Point]{
  let p1: Point, p2: Point;
	
  // covert drawing points to points
  [p1,p2] = convertAndNormalizeDrawingPointsToPoint(drawingPoints1, drawingPoints2, chart, series)

  // move points based on type of resize
  if(side === 'inside')
    [p1, p2] = offsetPoints(startPoint, endPoint, p1, p2)
  else
    [p1,p2] = resizeBoxByHandle(p1, p2, side, endPoint);

  // extend coordinates to the end of the chart
  /*
  if(extend){
    const end : Time= chart.timeScale().getVisibleRange()?.to as Time
    const endCoordinate = timeToCoordinateMax(end, chart)//chart.timeScale().timeToCoordinate(end)
    if (p2.x > p1.x) 
      p2 = { ...p2, x: endCoordinate! };  
    else 
      p1 = { ...p1, x: endCoordinate! };  
  }*/

  return [p1, p2]
}

export function resizeBoxByHandle(
  p1: Point,
  p2: Point,
  handle: BoxSide,
  mouse: Point
): [Point, Point] {
  // Normalize the box
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  let newP1 = { x: minX, y: minY };
  let newP2 = { x: maxX, y: maxY };

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
      const dx = mouse.x - (minX + (maxX - minX) / 2);
      const dy = mouse.y - (minY + (maxY - minY) / 2);
      newP1.x += dx;
      newP1.y += dy;
      newP2.x += dx;
      newP2.y += dy;
      break;
  }

  return [{x: newP1.x as Coordinate, y: newP1.y as Coordinate}, {x: newP2.x as Coordinate, y: newP2.y as Coordinate}  ];
  // Optional: Normalize again if your rendering expects top-left -> bottom-right
  /*
  const finalP1 = {
    x: Math.min(newP1.x, newP2.x),
    y: Math.min(newP1.y, newP2.y),
  };
  const finalP2 = {
    x: Math.max(newP1.x, newP2.x),
    y: Math.max(newP1.y, newP2.y),
  };

  return [finalP1, finalP2];*/
}

export type LineHandle = 'point1' | 'point2' | 'middle' | null;

export function resizeLineByHandle(
  p1: Point,
  p2: Point,
  handle: LineHandle,
  mouse: Point
): [Point, Point] {
  let newP1 = { ...p1 };
  let newP2 = { ...p2 };

  switch (handle) {
    case 'point1':
      newP1 = { ...mouse };
      break;
    case 'point2':
      newP2 = { ...mouse };
      break;
    case 'middle':
      const dx = mouse.x - (p1.x + p2.x) / 2;
      const dy = mouse.y - (p1.y + p2.y) / 2;
      newP1 = { x: p1.x + dx as Coordinate, y: p1.y + dy as Coordinate };
      newP2 = { x: p2.x + dx as Coordinate, y: p2.y + dy as Coordinate };
      break;
  }

  return [newP1, newP2];
}

export function getClosestHandleOnLine(
  chart: IChartApi,
  series: ISeriesApi<SeriesType>,
  p1: DrawingPoint,
  p2: DrawingPoint,
  mouse: Point,
  offset = 5
): LineHandle {
  const timeScale = chart.timeScale();
  const priceScale = series;

  const x1 = timeToCoordinateMax(p1.time, chart)
  const x2 = timeToCoordinateMax(p2.time, chart)
  //const x1 = timeScale.timeToCoordinate(p1.time);
  const y1 = priceScale.priceToCoordinate(p1.price);
 // const x2 = timeScale.timeToCoordinate(p2.time);
  const y2 = priceScale.priceToCoordinate(p2.price);

  if (x1 === null || y1 === null || x2 === null || y2 === null) return null;

  // Helper: distance from mouse to a point
  const dist = (pt: Point) => Math.hypot(mouse.x - pt.x, mouse.y - pt.y);

  // Check endpoints
  const d1 = dist({ x: x1, y: y1 });
  if (d1 <= offset) return 'point1';

  const d2 = dist({ x: x2, y: y2 });
  if (d2 <= offset) return 'point2';

  // Project mouse onto line segment
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) return null; // Degenerate line

  const t = ((mouse.x - x1) * dx + (mouse.y - y1) * dy) / lengthSq;
  const clampedT = Math.max(0, Math.min(1, t));

  const closestX = x1 + clampedT * dx;
  const closestY = y1 + clampedT * dy;

  const distanceToLine = Math.hypot(mouse.x - closestX, mouse.y - closestY);

  if (distanceToLine <= offset) return 'middle';

  return null;
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