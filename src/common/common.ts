import {
	Coordinate,
	Time,
} from 'lightweight-charts';

export interface DrawingPoint {
	time: Time;
	price: number;
}

export interface ViewPoint {
	x: Coordinate | null;
	y: Coordinate | null;
}

export function toolKeyName(name: string): string {
	return `tool_options_override_${name}`;
}


export const eventBus = new EventTarget();