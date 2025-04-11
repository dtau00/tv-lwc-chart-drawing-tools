import {
	CandlestickData,
	IChartApi,
	ISeriesApi,
	LineSeries,
	SeriesType,
	Time,
} from 'lightweight-charts';
import { generateUniqueId } from '../../helpers/id-generator.ts';
import { ChartDrawingsManager } from './charting/chart-drawings-manager.ts';
import { eventBus } from './common/common.ts';
import { ChartDrawingsToolbar } from './charting/toolbar/chart-drawing-toolbar.ts';
// This class is the main class for the chart drawing tools.

type DummyBar = {
	time : Time,
	value : number
}

export class ChartDrawingToolsPlugin {
	
	private _toolbar: ChartDrawingsToolbar;
	private _chartDrawingsManager: ChartDrawingsManager;
	private _whiteSpaceTotal: number = 100;
	private _whiteSpaceSeries: ISeriesApi<SeriesType>;
	private _chart: IChartApi;
	private _series: ISeriesApi<SeriesType>;
	private _secondsPerBar: number;
	private _lastSeriesDate : Time;
	private _lastWhiteSpaceSeriesDate : Time;
	private _dataInitialized = false;
	private _autoScrollBars : number;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		data: CandlestickData[],
		symbolName: string,
		secondsPerBar: number,
		chartDivContainer: HTMLDivElement,
		drawingsToolbarContainer: HTMLDivElement,
		subToolbarContainer: HTMLDivElement,
		id?: string,
		tags?: string[] | [],
		autoScroll?: number | 5,
	) {
		// either a user provides their own to track for their own purposes, or we generate one interally
		let chartId = id || generateUniqueId('chart_'); 

		this._chart = chart
		this._series = series
		this._secondsPerBar = secondsPerBar
		this._autoScrollBars = autoScroll ?? 5

		this.setData(data)
		
		// Create the global instance of chart drawings manager
		this._chartDrawingsManager = ChartDrawingsManager.getInstance();
		this._chartDrawingsManager.registerChart(chartDivContainer,chart, series, chartId, symbolName, secondsPerBar, tags || []);

		// Create the toolbar
		this._toolbar = new ChartDrawingsToolbar(this._chartDrawingsManager, drawingsToolbarContainer, subToolbarContainer, chartId);
	}

	// Expose the event bus so others can listen for chart and drawing events
	get eventBus(): EventTarget {
		return eventBus;
	}

	// needs to be set on init, or here
	public setData(data: CandlestickData[]) : void{
		if(!data.length) 
			return

		this._dataInitialized = true
		this._lastSeriesDate = data[data.length - 1].time;
		this._whiteSpaceSeries = this._initWhitespaceSeries(data)
		this._series.setData(data)

		// scroll to position
		this._autoScrollToPosition()
	}

	// this must be called when new data is added
	public updateData(bar : CandlestickData){
		if(!this._dataInitialized)
			throw new Error('Cant updateData before initializing base data')

		// update series with new data.  track number of new bars
		this._series.update(bar)

		// if we have new bars, generate same amount of dummy bars to keep the whitespacing
		if(bar.time > this._lastSeriesDate){
			this._lastSeriesDate = bar.time
			const dummyBars = this._generateDummyBars(this._lastWhiteSpaceSeriesDate, this._secondsPerBar, 1)
			this._whiteSpaceSeries.update(dummyBars[0])
			this._lastWhiteSpaceSeriesDate = dummyBars[dummyBars.length - 1].time
			this._autoScrollToPosition()
		}
	}

	//-------------- private methods ------------------------

	private _autoScrollToPosition(){
		if(this._autoScrollBars !== 0)
			this._chart.timeScale().scrollToPosition(-(this._whiteSpaceTotal - this._autoScrollBars), false);
	}

	private _initWhitespaceSeries(data : CandlestickData[]): ISeriesApi<SeriesType>{
		const whitespaceSeries = this._chart.addSeries(LineSeries);

		// apply initial bar data to whitespace series
		const whiteSpaceData = data.map(candle => ({
			time: candle.time,
			value: 0,
		} as DummyBar));

		// generate data padding to whitespace series,
		const dummyBars = this._generateDummyBars(data[data.length - 1].time, this._secondsPerBar, this._whiteSpaceTotal)
		whiteSpaceData.push(...dummyBars);

		// apply  whitespace data to series
		whitespaceSeries.setData(whiteSpaceData) 
		this._lastWhiteSpaceSeriesDate = whiteSpaceData[whiteSpaceData.length - 1].time
		
		return whitespaceSeries
	}

	private _generateDummyBars(startTime: Time, secondsPerBar: number, totalToGenerate: number): DummyBar[] {
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
}
