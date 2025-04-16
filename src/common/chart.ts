import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";


export function autoScrollToPosition(forceToPosition : boolean, autoScrollBars: number, totalWhiteSpace: number = 0, chart: IChartApi, series: ISeriesApi<SeriesType>, ){
    const barsToEndOfChart : number = barsFromLastBarToEndOfData(chart, series)
    const withinRange = barsToEndOfChart <= autoScrollBars && barsToEndOfChart > 0
    if(!forceToPosition && !withinRange) return;

    chart.timeScale().scrollToPosition(-(totalWhiteSpace - autoScrollBars), false);
}

export function barsFromLastBarToEndOfData(chart: IChartApi, series: ISeriesApi<any>): number {
    const logicalRange = chart.timeScale().getVisibleLogicalRange();
    const data = series.data();
    if (!logicalRange) return 0;
    if (!data || data.length === 0) return 0;

    const lastDataIndex = data.length - 1; 
    const visibleTo = Math.floor(logicalRange.to);
    return Math.max(0, visibleTo - lastDataIndex);
}