import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";
import { createSpacer } from "../../../../common/utils/html";
import { createColorSubTools, createOpacitySubTools } from "../common";
import { TOTAL_SUBTOOLS_PER_TYPE } from "../../../../common/constants";
import { RectangleLineExtendedDrawing } from "../../../drawings/rectangle-line-extended/rectangle-line-extended-drawing";

export class ToolRectangleLineExtended extends Tool {
    private _totalSubToolsPerType: number = TOTAL_SUBTOOLS_PER_TYPE
    
    constructor(toolbarId: string, name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(toolbarId, name, description, icon, toolType);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): RectangleLineExtendedDrawing {
        return new RectangleLineExtendedDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): void {
        createColorSubTools(this.toolbarId, 'strokeColor', this.name, this._totalSubToolsPerType,  container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createOpacitySubTools(this.toolbarId, 'strokeColorOpacity', this.name, this._totalSubToolsPerType, container, this.subTools, this.valueUpdatedCallback)
    }
}