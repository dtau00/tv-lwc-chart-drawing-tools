import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { RectangleDrawing } from "../../../drawings/rectangle/rectangle-drawing";
import Tool from "../tool-base";
import { DrawingToolType } from "../drawing-tools";
import { createSpacer } from "../../../../common/utils/html";
import { createColorSubTools, createOpacitySubTools } from "../common";
import { TOTAL_SUBTOOLS_PER_TYPE } from "../../../../common/constants";

export class ToolRectangle extends Tool {
    private _totalSubToolsPerType: number = TOTAL_SUBTOOLS_PER_TYPE
    
    constructor(toolbarId: string, name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(toolbarId, name, description, icon, toolType);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): RectangleDrawing {
        return new RectangleDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[] {
        let buttons: HTMLDivElement[] = [];

        createColorSubTools(this.toolbarId, 'fillColor', this.name, this._totalSubToolsPerType,  container, this.subTools, this.valueUpdatedCallback)
        container.appendChild(createSpacer());

        createOpacitySubTools(this.toolbarId, 'fillColorOpacity', this.name, this._totalSubToolsPerType, container, this.subTools, this.valueUpdatedCallback)

        return buttons; 
    }
}