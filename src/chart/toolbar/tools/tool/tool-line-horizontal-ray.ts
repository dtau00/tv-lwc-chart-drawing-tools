import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";
import { createSpacer } from "../../../../common/utils/html";
import { LineHorizontalRayDrawing } from "../../../drawings/line-horizontal-ray/line-horizontal-ray-drawing";
import { createColorSubTools, createLineStyleSubTools, createOpacitySubTools, createThicknessSubTools } from "../common";
import { TOTAL_SUBTOOLS_PER_TYPE } from "../../../../common/constants";

export class ToolLineHorizontalRay extends Tool {
    private _totalSubToolsPerType: number = TOTAL_SUBTOOLS_PER_TYPE
    
    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(name, description, icon, toolType, true);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): LineHorizontalRayDrawing {
        return new LineHorizontalRayDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[] {
        let buttons: HTMLDivElement[] = [];

        createColorSubTools('lineColor', this.name, this._totalSubToolsPerType,  container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createOpacitySubTools('lineColorOpacity', this.name, this._totalSubToolsPerType, container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createThicknessSubTools('lineWidth', this.name, this._totalSubToolsPerType, container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createLineStyleSubTools('lineDash', this.name, container, this.subTools, this.valueUpdatedCallback)

        return buttons; 
    }
}