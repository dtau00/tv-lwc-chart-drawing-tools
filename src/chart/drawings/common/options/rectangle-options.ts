import { isBusinessDay, Time } from "lightweight-charts";

export interface RectangleDrawingToolOptions {
	//opacity: number,
	fillColor: string;
	fillColorOpacity: number;
	strokeColor: string;
	strokeColorOpacity: number;
	labelColor: string;
	labelTextColor: string;
	showLabels: boolean;
	text: string;
	priceLabelFormatter: (price: number) => string;
	timeLabelFormatter: (time: Time) => string;
}

export const rectangleFillDrawingToolDefaultOptions: RectangleDrawingToolOptions = {
	//opacity: 1, // this doesnt seem to do anything
	fillColor: 'rgba(200, 50, 100, 0.25)',
	fillColorOpacity: 0.75,
	strokeColor: '',
	strokeColorOpacity: 1,
	labelColor: 'rgb(50, 147, 200)',
	labelTextColor: 'white',
	showLabels: false,
	text: '',
	priceLabelFormatter: (price: number) => price.toFixed(2),
	timeLabelFormatter: (time: Time) => {
		if (typeof time == 'string') return time;
		const date = isBusinessDay(time)
			? new Date(time.year, time.month, time.day)
			: new Date(time * 1000);
		return date.toLocaleDateString();
	},
};

export const rectangleLineDrawingToolDefaultOptions: RectangleDrawingToolOptions = {
	//opacity: 1, // this doesnt seem to do anything
	fillColor: '',
	fillColorOpacity: 0.0,
	strokeColor: 'rgba(200, 50, 100, 0.75)',
	strokeColorOpacity: 0.75,
	labelColor: 'rgb(50, 147, 200)',
	labelTextColor: 'white',
	showLabels: false,
	text: '',
	priceLabelFormatter: (price: number) => price.toFixed(2),
	timeLabelFormatter: (time: Time) => {
		if (typeof time == 'string') return time;
		const date = isBusinessDay(time)
			? new Date(time.year, time.month, time.day)
			: new Date(time * 1000);
		return date.toLocaleDateString();
	},
};

export function normalizeRectangleDrawingToolOptions(
	raw: Partial<Record<keyof RectangleDrawingToolOptions, any>>
): RectangleDrawingToolOptions {
	return {
		fillColor: typeof raw.fillColor === 'string'
			? raw.fillColor
			: rectangleFillDrawingToolDefaultOptions.fillColor,

		fillColorOpacity: Number(
			raw.fillColorOpacity ?? rectangleFillDrawingToolDefaultOptions.fillColorOpacity
		),
		strokeColor: typeof raw.strokeColor === 'string'
			? raw.strokeColor
			: rectangleFillDrawingToolDefaultOptions.strokeColor,

		strokeColorOpacity: Number(
			raw.strokeColorOpacity ?? rectangleFillDrawingToolDefaultOptions.strokeColorOpacity
		),

		labelColor: typeof raw.labelColor === 'string'
			? raw.labelColor
			: rectangleFillDrawingToolDefaultOptions.labelColor,

		labelTextColor: typeof raw.labelTextColor === 'string'
			? raw.labelTextColor
			: rectangleFillDrawingToolDefaultOptions.labelTextColor,
		text: typeof raw.text === 'string' ? raw.text : rectangleFillDrawingToolDefaultOptions.text,
		showLabels:
			typeof raw.showLabels === 'boolean'
				? raw.showLabels
				: raw.showLabels === 'true'
				? true
				: raw.showLabels === 'false'
				? false
				: rectangleFillDrawingToolDefaultOptions.showLabels,

		priceLabelFormatter:
			typeof raw.priceLabelFormatter === 'function'
				? raw.priceLabelFormatter
				: rectangleFillDrawingToolDefaultOptions.priceLabelFormatter,

		timeLabelFormatter:
			typeof raw.timeLabelFormatter === 'function'
				? raw.timeLabelFormatter
				: rectangleFillDrawingToolDefaultOptions.timeLabelFormatter,
	};
}