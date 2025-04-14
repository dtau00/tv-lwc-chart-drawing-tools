import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { FibonacciDrawing } from "../../../drawings/fibonacci/fibonacci-drawing";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";
import { createSpacer } from "../../../../common/utils/html";
import { createColorSubTools, createOpacitySubTools } from "../common";
import { TOTAL_SUBTOOLS_PER_TYPE } from "../../../../common/constants";

export class ToolFibonacci extends Tool {
    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(name, description, icon, toolType);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): FibonacciDrawing {
        return new FibonacciDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[] {
        let buttons: HTMLDivElement[] = [];

        createColorSubTools('lineColor', this.name, TOTAL_SUBTOOLS_PER_TYPE,  container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createOpacitySubTools('lineColorOpacity', this.name, TOTAL_SUBTOOLS_PER_TYPE, container, this.subTools, this.valueUpdatedCallback)

        return buttons; 
    }
}