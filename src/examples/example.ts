import { createChart, ColorType, CandlestickSeries, CandlestickData, Time, LineSeries } from 'lightweight-charts';
//=import { generateCandlestickData } from './helpers/sample-data';
import { ChartDrawingToolsPlugin } from '../plugins/chart-drawing-tools/chart-drawing-tools-plugin.ts';
import {dataSampleInit, dataSampleStream} from './data-sample.ts';

const data : CandlestickData[] = JSON.parse(dataSampleInit) // using hard coded data for consistency
const dataStream : CandlestickData[] = JSON.parse(dataSampleStream) //hard coded data for streaming new bars
//const data = generateCandlestickData(); // or use randomized data each time on load

const secondsPerBar : number = 86400
try{
	const plugin1 = generateChart('chartId1', 'AAPL', secondsPerBar, 'chart1', 'toolbar1', 'subtoolbar1', data);
}catch{}

try{
	const plugin2 = generateChart('chartId2', 'AAPL', secondsPerBar, 'chart2', 'toolbar2', 'subtoolbar2', data);
}catch{}

try{
	const plugin3 = generateChart('chartId3', 'BTC', secondsPerBar, 'chart3', 'toolbar3', 'subtoolbar3', data);

	// test, adding new bars to chart
	setInterval(()=>{
		const nextBar = dataStream.shift()
		if(nextBar)
			plugin3.updateData(nextBar)
	},1000)
}
catch{}



function generateChart(id: string, symbol: string, secondsPerBar: number, chartContainerId : string, toolbarContainerId : string, subToolbarContainerId : string, data: CandlestickData[]) : ChartDrawingToolsPlugin {
	// create the chart
	const chart = ((window as unknown as any).chart = createChart(chartContainerId, {
		autoSize: true,
		layout: {
			background: { type: ColorType.Solid, color: 'charcoal' },
		},
		grid: {
			vertLines: {
				visible: false,
			},
			horzLines: {
				visible: false,
			},
			},
	}));
	
	const candlestickSeries = chart.addSeries(CandlestickSeries);

	// create the plugin
	return new ChartDrawingToolsPlugin(
		chart,
		candlestickSeries,
		data,
		symbol,
		secondsPerBar,
		document.querySelector<HTMLDivElement>(`#${chartContainerId}`)!,
		document.querySelector<HTMLDivElement>(`#${toolbarContainerId}`)!,
		document.querySelector<HTMLDivElement>(`#${subToolbarContainerId}`)!,
		id, 
	); 
}
