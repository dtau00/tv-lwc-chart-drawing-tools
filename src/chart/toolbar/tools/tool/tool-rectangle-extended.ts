import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { RectangleExtendedDrawing } from "../../../drawings/rectangle-extended/rectangle-extended-drawing";
import Tool from "../tool-base";
import { SubToolColor } from "../../sub-tools/sub-tool/sub-tool-color";
import { SubToolOpacity } from "../../sub-tools/sub-tool/sub-tool-opacity"
import { DrawingSubToolType, DrawingSubTools } from "../../sub-tools/drawing-sub-tools";
import { DrawingToolType } from "../drawing-tools";
import { setSubToolbarButton } from "../../common";
import { createSpacer } from "../../../../common/html";

export class ToolRectangleExtended extends Tool {
    private readonly  _totalColors: number = 3
    private readonly  _totalOpacities: number = 3

    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(name, description, icon, toolType);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): RectangleExtendedDrawing {
        return new RectangleExtendedDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[] {
        let buttons: HTMLDivElement[] = [];

        // TODO we can clean this up more
        let type = DrawingSubTools.get(DrawingSubToolType.Color);
        for(let i = 0; i < this._totalColors; i++){
            const subTool = new SubToolColor("fillColor", this.name, type?.name || '', type?.description || '', type?.icon || '', i, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }

        container.appendChild(createSpacer());

        type = DrawingSubTools.get(DrawingSubToolType.Opacity);
        for(let i = 0; i < this._totalOpacities; i++){
            const subTool = new SubToolOpacity("fillColorOpacity", this.name, type?.name || '', type?.description || '', type?.icon || '', i, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }

        return buttons; 
    }
}