import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import Tool from "../tool-base";
import { SubToolColor } from "../../sub-tools/sub-tool/sub-tool-color";
import { SubToolOpacity } from "../../sub-tools/sub-tool/sub-tool-opacity"
import { SubToolThickness } from "../../sub-tools/sub-tool/sub-tool-thickness";
import { DrawingSubToolType, DrawingSubTools } from "../../sub-tools/drawing-sub-tools";
import { DrawingToolType } from "../drawing-tools";
import { setSubToolbarButton } from "../../common";
import { createSpacer } from "../../../../common/utils/html";
import { LineDrawing } from "../../../drawings/line/line-drawing";
import { SubToolSolid } from "../../sub-tools/sub-tool/sub-tool-solid";
import { SubToolDotted } from "../../sub-tools/sub-tool/sub-tool-dotted";
import { SubToolDashed } from "../../sub-tools/sub-tool/sub-tool-dashed";

export class ToolLine extends Tool {
    private readonly  _totalColors: number = 3
    private readonly  _totalOpacities: number = 3
    private readonly  _totalThicknesses: number = 3

    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        super(name, description, icon, toolType);
    }

    getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): LineDrawing {
        return new LineDrawing(chart, series, symbolName);
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
       
        container.appendChild(createSpacer());

        type = DrawingSubTools.get(DrawingSubToolType.Solid);
        if(type){
            const subTool = new SubToolSolid("lineDash", this.name, type.name, type.description, type.icon, 0, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }

        type = DrawingSubTools.get(DrawingSubToolType.Dotted);
        if(type){
            const subTool = new SubToolDotted("lineDash", this.name, type.name, type.description, type.icon, 1, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }

        type = DrawingSubTools.get(DrawingSubToolType.Dashed);
        if(type){
            const subTool = new SubToolDashed("lineDash", this.name, type.name, type.description, type.icon, 2, this.valueUpdatedCallback);
            setSubToolbarButton(subTool, this.subTools, container);
        }
        
        return buttons; 
    }
}