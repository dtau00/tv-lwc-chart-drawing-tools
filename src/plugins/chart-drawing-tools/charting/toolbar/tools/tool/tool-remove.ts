import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { RectangleDrawing } from "../../../drawings/rectangle/rectangle-drawing";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";

export class ToolRemove extends Tool {
    defaultMouseListener(evt: MouseEvent, index?: number): void {
        throw new Error("Method not implemented.");
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): RectangleDrawing {
        throw new Error("Method not implemented.");
    }

    setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[] {
        throw new Error("Method not implemented.");
    }

    listener(evt: MouseEvent, index?: number): void {
        throw new Error("Method not implemented.");
    }

    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(name, description, icon, toolType);
    }
}