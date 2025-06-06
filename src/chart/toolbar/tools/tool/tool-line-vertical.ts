import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";
import { createSpacer } from "../../../../common/utils/html";
import { LineVerticalDrawing } from "../../../drawings/line-vertical/line-vertical-drawing";
import { createColorSubTools, createLineStyleSubTools, createOpacitySubTools, createThicknessSubTools } from "../common";
import { TOTAL_SUBTOOLS_PER_TYPE } from "../../../../common/constants";

export class ToolLineVertical extends Tool {
    private _totalSubToolsPerType: number = TOTAL_SUBTOOLS_PER_TYPE
    
    constructor(toolbarId: string, name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(toolbarId, name, description, icon, toolType, true);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): LineVerticalDrawing {
        return new LineVerticalDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): void{
        createColorSubTools(this.toolbarId, 'lineColor', this.name, this._totalSubToolsPerType,  container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createOpacitySubTools(this.toolbarId, 'lineColorOpacity', this.name, this._totalSubToolsPerType, container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createThicknessSubTools(this.toolbarId, 'lineWidth', this.name, this._totalSubToolsPerType, container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createLineStyleSubTools(this.toolbarId, 'lineDash', this.name, container, this.subTools, this.valueUpdatedCallback)
    }
}