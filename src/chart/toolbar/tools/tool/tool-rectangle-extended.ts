import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { RectangleExtendedDrawing } from "../../../drawings/rectangle-extended/rectangle-extended-drawing";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";
import { createSpacer } from "../../../../common/utils/html";
import { createColorSubTools, createOpacitySubTools } from "../common";
import { TOTAL_SUBTOOLS_PER_TYPE } from "../../../../common/constants";

export class ToolRectangleExtended extends Tool {
    private _totalSubToolsPerType: number = TOTAL_SUBTOOLS_PER_TYPE
    
    constructor(toolbarId: string, name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(toolbarId, name, description, icon, toolType);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): RectangleExtendedDrawing {
        return new RectangleExtendedDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): void {
        createColorSubTools(this.toolbarId, 'fillColor', this.name, this._totalSubToolsPerType,  container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createOpacitySubTools(this.toolbarId, 'fillColorOpacity', this.name, this._totalSubToolsPerType, container, this.subTools, this.valueUpdatedCallback)
    }
}