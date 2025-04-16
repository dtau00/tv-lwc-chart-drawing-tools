import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { FibonacciDrawing } from "../../../drawings/fibonacci/fibonacci-drawing";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";
import { createSpacer } from "../../../../common/utils/html";
import { createColorSubTools, createOpacitySubTools } from "../common";
import { TOTAL_SUBTOOLS_PER_TYPE } from "../../../../common/constants";

export class ToolFibonacci extends Tool {
    constructor(toolbarId: string, name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(toolbarId, name, description, icon, toolType);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): FibonacciDrawing {
        return new FibonacciDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): void {
        createColorSubTools(this.toolbarId, 'color', this.name, TOTAL_SUBTOOLS_PER_TYPE,  container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createOpacitySubTools(this.toolbarId, 'colorOpacity', this.name, TOTAL_SUBTOOLS_PER_TYPE, container, this.subTools, this.valueUpdatedCallback)
    }
}