import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { RectangleDrawing } from "../../../drawings/rectangle/rectangle-drawing";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";

export class ToolRemove extends Tool {
    // not needed for this tool
    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): any {
        throw new Error("Method not implemented.");
    }

    // not needed for this tool
    setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[] {
        throw new Error("Method not implemented.");
    }

    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(name, description, icon, toolType);
    }
}