import { CandlestickData, IChartApi, ISeriesApi, LineSeries, SeriesType, Time } from "lightweight-charts";

export type DummyBar = {
    time : Time,
    value : number
}

export function generateDummyBars(startTime: Time, secondsPerBar: number, totalToGenerate: number): DummyBar[] {
    const newTimes: DummyBar[] = [];
    let timeNum = Number(startTime); 

    for (let i = 0; i < totalToGenerate; i++) {
        timeNum += secondsPerBar;
        newTimes.push({
            time: timeNum as Time,
            value: 0,
        } as DummyBar);
    }

    return newTimes;
}

export function initWhitespaceSeries(data : CandlestickData[], secondsPerBar: number, totalWhiteSpace: number, chart: IChartApi): ISeriesApi<SeriesType>{
    const whitespaceSeries = chart.addSeries(LineSeries);

    // apply initial bar data to whitespace series
    const whiteSpaceData = data.map(candle => ({
        time: candle.time,
        value: 0,
    } as DummyBar));

    // generate data padding to whitespace series,
    const dummyBars = generateDummyBars(data[data.length - 1].time, secondsPerBar, totalWhiteSpace)
    whiteSpaceData.push(...dummyBars);

    // apply  whitespace data to series
    whitespaceSeries.setData(whiteSpaceData) 

    return whitespaceSeries
}