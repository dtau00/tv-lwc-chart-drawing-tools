import { createChart, ColorType, CandlestickSeries, CandlestickData, Time } from 'lightweight-charts';
//import { generateCandlestickData } from './helpers/sample-data';
import { ChartDrawingToolsPlugin } from './plugins/chart-drawing-tools/plugin';
import {dataSample} from './data-sample.ts';

const data : CandlestickData[] = JSON.parse(dataSample) // using hard coded data for consistency
//const data = generateCandlestickData(); // or use randomized data each time on load

const plugin1 = generateChart('chartId1', 'AAPL', 1, 'chart1', 'toolbar1', data);
const plugin2 = generateChart('chartId2', 'BTC', 1, 'chart2', 'toolbar2', data);
//const plugin3 = generateChart('chartId3', 'BTC', 5, 'chart3', 'toolbar3', data);

function generateChart(id: string, symbol: string, secondsPerBar: number, chartContainerId : string, toolbarContainerId : string, data: CandlestickData[]) : ChartDrawingToolsPlugin {
	// create the chart
	const chart = ((window as unknown as any).chart = createChart(chartContainerId, {
		autoSize: true,
		layout: {
			background: { type: ColorType.Solid, color: 'charcoal' },
		},
	}));
	
	const candlestickSeries = chart.addSeries(CandlestickSeries);
	candlestickSeries.setData(data)
	//candlestickSeries.setData(data ? data : generateCandlestickData())

	// add the symbol as a header above the chart
	const div = document.querySelector<HTMLDivElement>(`#${chartContainerId}`);
	if (div) {
		const headerDiv = document.createElement('h1');
		headerDiv.innerHTML = symbol; // Set the text of the header
		div.parentNode?.insertBefore(headerDiv, div);
	}

	// create the plugin
	return new ChartDrawingToolsPlugin(
		chart,
		candlestickSeries,
		symbol,
		secondsPerBar,
		document.querySelector<HTMLDivElement>(`#${chartContainerId}`)!,
		document.querySelector<HTMLDivElement>(`#${toolbarContainerId}`)!,
		id, 
	); 
}
