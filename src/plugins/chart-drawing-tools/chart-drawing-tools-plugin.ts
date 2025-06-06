import { CandlestickData, IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { generateUniqueId } from '../../common/utils/id-generator.ts';
import { ChartDrawingsManager } from '../../chart/chart-drawings-manager.ts';
import { ChartContainer } from '../../chart/chart-container/chart-container.ts';

export class ChartDrawingToolsPlugin {
	private _chartDrawingsManager: ChartDrawingsManager;
	private _chartContainer: ChartContainer | null;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		data: CandlestickData[],
		symbolName: string,
		secondsPerBar: number,
		chartDivContainer: HTMLDivElement,
		drawingsToolbarContainer?: HTMLDivElement,
		subToolbarContainer?: HTMLDivElement,
		id?: string,
		tags?: string[] | [],
		autoScroll?: number | 5,
	) {
		// either a user provides their own to track for their own purposes, or we generate one interally
		let chartId = id || generateUniqueId('chart_'); 

		// Create the global instance of chart drawings manager
		this._chartDrawingsManager = ChartDrawingsManager.getInstance();

		// get the chartContainer that this plugin instance will be tied to
		this._chartContainer = this._chartDrawingsManager.registerChart(chartDivContainer,chart, series, chartId, symbolName, secondsPerBar, tags || []);
		
		// set initial data
		this.setData(data)

		// Create the toolbar
		if(drawingsToolbarContainer && subToolbarContainer)
			this._chartDrawingsManager.registerToolbar(drawingsToolbarContainer, subToolbarContainer, chartId)
	}

	setData(data: CandlestickData[]) : boolean{
		return this._chartContainer?.setData(data) ?? false
	}

	updateData(bar : CandlestickData){
		this._chartContainer?.updateData(bar)
	}

		// Expose the event bus so others can listen for chart and drawing events
	/*
	get eventBus(): EventTarget {
		return eventBus;
	}*/

}
