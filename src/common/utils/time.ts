import { Time, isUTCTimestamp, isBusinessDay, Coordinate, IChartApi, Logical } from 'lightweight-charts';

export function convertTime(t: Time): number {
	if (isUTCTimestamp(t)) return t * 1000;
	if (isBusinessDay(t)) return new Date(t.year, t.month, t.day).valueOf();
	const [year, month, day] = t.split('-').map(parseInt);
	return new Date(year, month, day).valueOf();
}

export function displayTime(time: Time): string {
	if (typeof time == 'string') return time;
	const date = isBusinessDay(time)
		? new Date(time.year, time.month, time.day)
		: new Date(time * 1000);
	return date.toLocaleDateString();
}

export function formattedDateAndTime(timestamp: number | undefined): [string, string] {
	if (!timestamp) return ['', ''];
	const dateObj = new Date(timestamp);

	// Format date string
	const year = dateObj.getFullYear();
	const month = dateObj.toLocaleString('default', { month: 'short' });
	const date = dateObj.getDate().toString().padStart(2, '0');
	const formattedDate = `${date} ${month} ${year}`;

	// Format time string
	const hours = dateObj.getHours().toString().padStart(2, '0');
	const minutes = dateObj.getMinutes().toString().padStart(2, '0');
	const formattedTime = `${hours}:${minutes}`;

	return [formattedDate, formattedTime];
}

export function timeToCoordinateMax(time: Time,chart : IChartApi) : Coordinate | null{
	const timeScale = chart.timeScale();
	let x: Coordinate | null = null

	// library will throw up if the date is very large, so need in a try/catch block
	try{ x = timeScale.timeToCoordinate(time); }catch{}

	// Fallback: if coordinate is not available (offscreen or no data), use the end of the visible range
	if (x === null) {
		const visibleRange = timeScale.getVisibleRange();
		if (visibleRange) {
			const t = Number(time)
			const to = Number(visibleRange.to)
			const from = Number(visibleRange.from)

			if(t >= to)
				x = timeScale.timeToCoordinate(visibleRange.to); // or `.to` if that makes more sense
			else if(t <= from)
				x = timeScale.timeToCoordinate(visibleRange.from); 
		}
	}

	return x
}

export function coordinateToTimeMax(coord: Coordinate, chart: IChartApi): Time | null {
	const timeScale = chart.timeScale()
	let time : Time | null = timeScale.coordinateToTime(coord)

	// if time is null the we are off the available data
	if(time === null){
		const logicalPos = timeScale.coordinateToLogical(coord)
		if(logicalPos !== null && logicalPos <= 0){ // if its to the left of the chart
			const begin = timeScale.logicalToCoordinate(0 as Logical)
			time = timeScale.coordinateToTime(begin!)
		}
		else // its to the right of the chart
			time = timeScale.getVisibleRange()?.to!
	}

	return time
}
