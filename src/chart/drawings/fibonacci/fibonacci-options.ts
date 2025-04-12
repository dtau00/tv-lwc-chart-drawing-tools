import { isBusinessDay, Time } from "lightweight-charts";

export interface FibonacciDrawingToolOptions {
	//opacity: number,
	color: string,
	colorOpacity: number,
	labelColor: string;
	labelTextColor: string;
	showLabels: boolean;
	priceLabelFormatter: (price: number) => string;
	timeLabelFormatter: (time: Time) => string;
}

export const fibonacciDrawingToolDefaultOptions: FibonacciDrawingToolOptions = {
	//opacity: 1, // this doesnt seem to do anything
	color: 'rgba(200, 50, 100, 0.25)',
	colorOpacity: 1,
	labelColor: 'rgb(50, 147, 200)',
	labelTextColor: 'white',
	showLabels: false,
	priceLabelFormatter: (price: number) => price.toFixed(2),
	timeLabelFormatter: (time: Time) => {
		if (typeof time == 'string') return time;
		const date = isBusinessDay(time)
			? new Date(time.year, time.month, time.day)
			: new Date(time * 1000);
		return date.toLocaleDateString();
	},
};

export function normalizeFibonacciDrawingToolOptions(
	options: Partial<FibonacciDrawingToolOptions>
): FibonacciDrawingToolOptions {
	return {
		color: options.color ?? fibonacciDrawingToolDefaultOptions.color,
		colorOpacity: options.colorOpacity ?? fibonacciDrawingToolDefaultOptions.colorOpacity,
		labelColor: options.labelColor ?? fibonacciDrawingToolDefaultOptions.labelColor,
		labelTextColor: options.labelTextColor ?? fibonacciDrawingToolDefaultOptions.labelTextColor,
		showLabels: options.showLabels ?? fibonacciDrawingToolDefaultOptions.showLabels,
		priceLabelFormatter: options.priceLabelFormatter ?? fibonacciDrawingToolDefaultOptions.priceLabelFormatter,
		timeLabelFormatter: options.timeLabelFormatter ?? fibonacciDrawingToolDefaultOptions.timeLabelFormatter,
	};
}