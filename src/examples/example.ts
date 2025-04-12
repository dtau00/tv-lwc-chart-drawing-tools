import { createChart, ColorType, CandlestickSeries, CandlestickData, Time, LineSeries } from 'lightweight-charts';
//import { generateCandlestickData } from './helpers/sample-data';
import { ChartDrawingToolsPlugin } from '../plugins/chart-drawing-tools/chart-drawing-tools-plugin.ts';
import {dataSampleInit, dataSampleStream} from './data-sample.ts';

const data : CandlestickData[] = JSON.parse(dataSampleInit) // using hard coded data for consistency
const dataStream : CandlestickData[] = JSON.parse(dataSampleStream) //hard coded data for streaming new bars
//const data = generateCandlestickData(); // or use randomized data each time on load

const secondsPerBar : number = 86400
const plugin1 = generateChart('chartId1', 'AAPL', secondsPerBar, 'chart1', 'toolbar1', 'subtoolbar1', data);
//const plugin2 = generateChart('chartId2', 'AAPL', secondsPerBar, 'chart2', 'toolbar2', 'subtoolbar2', data);

//const plugin3 = generateChart('chartId3', 'BTC', 5, 'chart3', 'toolbar3', 'subtoolbar3', data);

// test, adding new bars to chart
setInterval(()=>{
	const nextBar = dataStream.shift()
	//if(nextBar)
		//plugin2.updateData(nextBar)
},1000)


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
	//candlestickSeries.setData(data)

	//candlestickSeries.setData(data ? data : generateCandlestickData())

	// add the symbol as a header above the chart
	/*
	const div = document.querySelector<HTMLDivElement>(`#${toolbarContainerId}`);
	if (div) {
		const headerDiv = document.createElement('h1');
		headerDiv.innerHTML = symbol; // Set the text of the header
		div.parentNode?.insertBefore(headerDiv, div);
	}*/

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
