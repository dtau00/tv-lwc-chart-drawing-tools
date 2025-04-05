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

export class ChartDrawingToolsPlugin {
	
	private _toolbar: ChartDrawingsToolbar;
	private _chartDrawingsManager: ChartDrawingsManager;
	private _whiteSpaceTotal: number = 100;
	private _whiteSpaceSeries: ISeriesApi<SeriesType>;
	private _chart: IChartApi;
	private _series: ISeriesApi<SeriesType>;
	private _data: CandlestickData[];
	private _secondsPerBar: number;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		data: CandlestickData[],
		symbolName: string,
		secondsPerBar: number,
		chartDivContainer: HTMLDivElement,
		drawingsToolbarContainer: HTMLDivElement,
		id?: string,
		tags?: string[] | [],
	) {
		// either a user provides their own to track for their own purposes, or we generate one interally
		let chartId = id || generateUniqueId('chart_'); 

		this._chart = chart
		this._series = series
		this._secondsPerBar = secondsPerBar
		this.setData(data)
		this._whiteSpaceSeries = this._initWhitespaceSeries(data)
		
		// Create the global instance of chart drawings manager
		this._chartDrawingsManager = ChartDrawingsManager.getInstance();
		this._chartDrawingsManager.registerChart(chartDivContainer,chart, series, chartId, symbolName, secondsPerBar, tags || []);

		// Create the toolbar
		this._toolbar = new ChartDrawingsToolbar(this._chartDrawingsManager, drawingsToolbarContainer, chartId);
	}

	// Expose the event bus so others can listen for chart and drawing events
	get eventBus(): EventTarget {
		return eventBus;
	}

	// needs to be set on init, or here
	public setData(data: CandlestickData[]){
		if(data && data.length > 0){
			this._data = data
			this._whiteSpaceSeries = this._initWhitespaceSeries(data)
		}
	}

	// this must be called when new data is added
	public updateData(data: CandlestickData[]){
		// TODO we will update the whitespace as needed, to whitespace
		// track last candle time
		// if new candle added, check how far from target whitespace are we
		// fill to target whitespace
	}

	private _initWhitespaceSeries(data : CandlestickData[]): ISeriesApi<SeriesType>{
		const whitespaceSeries = this._chart.addSeries(LineSeries);
		let whiteSpaceData : {time: Time, value: number}[] = []
		let time : Time = ""
		for(const candle of data){
			time = candle.time
			whiteSpaceData.push({
				time: time,
				value: 0,
			})
		}

		for(let i = 0; i < this._whiteSpaceTotal; i++){
			let tm : number = Number(time.toString())
			tm += this._secondsPerBar
			time = tm as Time
			whiteSpaceData.push({
				time: time,
				value: 0,
			})
		}
		whitespaceSeries.setData(whiteSpaceData)
		return whitespaceSeries
	}
}
