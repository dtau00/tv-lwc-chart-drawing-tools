import {
	IChartApi,
	ISeriesApi,
	SeriesType,
} from 'lightweight-charts';
import { generateUniqueId } from '../../helpers/id-generator.ts';
import { ChartDrawingsManager } from './components/manager/chart-drawings-manager.ts';
import { eventBus } from './common/common.ts';
import { ChartDrawingsToolbar } from './components/toolbar/chart-drawing-toolbar.ts';
// This class is the main class for the chart drawing tools.

export class ChartDrawingToolsPlugin {
	
	private _toolbar: ChartDrawingsToolbar;
	private _chartDrawingsManager: ChartDrawingsManager;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
		symbolName: string,
		secondsPerBar: number,
		chartDivContainer: HTMLDivElement,
		drawingsToolbarContainer: HTMLDivElement,
		id?: string,
		tags?: string[] | [],
	) {

		// either a user provides their own to track for their own purposes, or we generate one interally
		let chartId = id || generateUniqueId('chart_'); 

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
}
