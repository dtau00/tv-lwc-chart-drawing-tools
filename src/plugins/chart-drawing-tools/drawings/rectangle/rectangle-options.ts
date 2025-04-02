import { isBusinessDay, Time } from "lightweight-charts";

export interface RectangleDrawingToolOptions {
	opacity: number,
	fillColor: string;
	previewFillColor: string;
	labelColor: string;
	labelTextColor: string;
	showLabels: boolean;
	priceLabelFormatter: (price: number) => string;
	timeLabelFormatter: (time: Time) => string;
}

export const defaultOptions: RectangleDrawingToolOptions = {
	opacity: 1, // this doesnt seem to do anything
	fillColor: 'rgba(200, 50, 100, 0.25)',
	//previewFillColor: 'rgba(200, 50, 100, 0.25)',
	previewFillColor: 'rgba(100, 100, 100, 0.25)',
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