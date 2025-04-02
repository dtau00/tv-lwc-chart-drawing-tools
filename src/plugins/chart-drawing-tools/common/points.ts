import { IChartApi, ISeriesApi, Point, SeriesType, Time } from "lightweight-charts";
import { DrawingPoint } from "./common";

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
