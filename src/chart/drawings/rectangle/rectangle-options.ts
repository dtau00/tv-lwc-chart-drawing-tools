import { isBusinessDay, Time } from "lightweight-charts";

export interface RectangleDrawingToolOptions {
	//opacity: number,
	fillColor: string;
	fillColorOpacity: number;
	labelColor: string;
	labelTextColor: string;
	showLabels: boolean;
	priceLabelFormatter: (price: number) => string;
	timeLabelFormatter: (time: Time) => string;
}

export const rectangleDrawingToolDefaultOptions: RectangleDrawingToolOptions = {
	//opacity: 1, // this doesnt seem to do anything
	fillColor: 'rgba(200, 50, 100, 0.25)',
	fillColorOpacity: 0.75,
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

export function normalizeRectangleDrawingToolOptions(
	raw: Partial<Record<keyof RectangleDrawingToolOptions, any>>
): RectangleDrawingToolOptions {
	return {
		fillColor: typeof raw.fillColor === 'string'
			? raw.fillColor
			: rectangleDrawingToolDefaultOptions.fillColor,

		fillColorOpacity: Number(
			raw.fillColorOpacity ?? rectangleDrawingToolDefaultOptions.fillColorOpacity
		),

		labelColor: typeof raw.labelColor === 'string'
			? raw.labelColor
			: rectangleDrawingToolDefaultOptions.labelColor,

		labelTextColor: typeof raw.labelTextColor === 'string'
			? raw.labelTextColor
			: rectangleDrawingToolDefaultOptions.labelTextColor,

		showLabels:
			typeof raw.showLabels === 'boolean'
				? raw.showLabels
				: raw.showLabels === 'true'
				? true
				: raw.showLabels === 'false'
				? false
				: rectangleDrawingToolDefaultOptions.showLabels,

		priceLabelFormatter:
			typeof raw.priceLabelFormatter === 'function'
				? raw.priceLabelFormatter
				: rectangleDrawingToolDefaultOptions.priceLabelFormatter,

		timeLabelFormatter:
			typeof raw.timeLabelFormatter === 'function'
				? raw.timeLabelFormatter
				: rectangleDrawingToolDefaultOptions.timeLabelFormatter,
	};
}