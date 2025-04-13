import { isBusinessDay, Time } from "lightweight-charts";

export interface LineDrawingToolOptions {
	//opacity: number,
	lineColor: string;
	lineColorOpacity: number;
	lineWidth: number;
	lineDash: string,
	labelColor: string;
	labelTextColor: string;
	showLabels: boolean;
	priceLabelFormatter: (price: number) => string;
	timeLabelFormatter: (time: Time) => string;
}

export const lineDrawingToolDefaultOptions: LineDrawingToolOptions = {
	//opacity: 1, // this doesnt seem to do anything
	lineColor: 'rgba(200, 50, 100, 0.25)',
	lineColorOpacity: 0.75,
	lineWidth: 2,
	lineDash: '',
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

export function normalizeLineDrawingToolOptions(
	raw: Partial<Record<keyof LineDrawingToolOptions, any>>
): LineDrawingToolOptions {
	return {
		lineColor: typeof raw.lineColor === 'string' ? raw.lineColor : lineDrawingToolDefaultOptions.lineColor,
		lineColorOpacity: Number(raw.lineColorOpacity ?? lineDrawingToolDefaultOptions.lineColorOpacity),
		lineWidth: Number(raw.lineWidth ?? lineDrawingToolDefaultOptions.lineWidth),
		labelColor: typeof raw.labelColor === 'string' ? raw.labelColor : lineDrawingToolDefaultOptions.labelColor,
		lineDash: typeof raw.lineDash === 'string' ? raw.lineDash : lineDrawingToolDefaultOptions.lineDash,
		labelTextColor:
			typeof raw.labelTextColor === 'string' ? raw.labelTextColor : lineDrawingToolDefaultOptions.labelTextColor,
		showLabels:
			typeof raw.showLabels === 'boolean'
				? raw.showLabels
				: raw.showLabels === 'true'
				? true
				: raw.showLabels === 'false'
				? false
				: lineDrawingToolDefaultOptions.showLabels,

		priceLabelFormatter:
			typeof raw.priceLabelFormatter === 'function'
				? raw.priceLabelFormatter
				: lineDrawingToolDefaultOptions.priceLabelFormatter,

		timeLabelFormatter:
			typeof raw.timeLabelFormatter === 'function'
				? raw.timeLabelFormatter
				: lineDrawingToolDefaultOptions.timeLabelFormatter,
	};
}