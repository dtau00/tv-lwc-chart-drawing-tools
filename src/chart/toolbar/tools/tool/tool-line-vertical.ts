import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import Tool from "../tool-base";
import { SubToolColor } from "../../sub-tools/sub-tool/sub-tool-color";
import { SubToolOpacity } from "../../sub-tools/sub-tool/sub-tool-opacity"
import { SubToolThickness } from "../../sub-tools/sub-tool/sub-tool-thickness";
import { DrawingSubToolType, DrawingSubTools } from "../../sub-tools/drawing-sub-tools";
import { DrawingToolType } from "../drawing-tools";
import { setSubToolbarButton } from "../../common";
import { createSpacer } from "../../../../common/html";
import { LineVerticalDrawing } from "../../../drawings/line-vertical/line-vertical-drawing";

export class ToolLineVertical extends Tool {
    private readonly  _totalColors: number = 3
    private readonly  _totalOpacities: number = 3
    private readonly  _totalThicknesses: number = 3

    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(name, description, icon, toolType, true);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): LineVerticalDrawing {
        return new LineVerticalDrawing(chart, series, symbolName);
    }
    
    setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[] {
        let buttons: HTMLDivElement[] = [];

        // TODO clean this up
        let type = DrawingSubTools.get(DrawingSubToolType.Color);
        for(let i = 0; i < this._totalColors; i++){
            const subTool = new SubToolColor("lineColor", this.name, type?.name || '', type?.description || '', type?.icon || '', i, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }
        
        container.appendChild(createSpacer());

        type = DrawingSubTools.get(DrawingSubToolType.Opacity);
        for(let i = 0; i < this._totalOpacities; i++){
            const subTool = new SubToolOpacity("lineColorOpacity", this.name, type?.name || '', type?.description || '', type?.icon || '', i, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }

        container.appendChild(createSpacer());
        
        type = DrawingSubTools.get(DrawingSubToolType.Thickness);
        for(let i = 0; i < this._totalThicknesses; i++){
            const subTool = new SubToolThickness("lineWidth", this.name, type?.name || '', type?.description || '', type?.icon || '', i, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }
       
        return buttons; 
    }
}