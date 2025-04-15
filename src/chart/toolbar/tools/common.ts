import { setSubToolbarButton } from "../common";
import { DrawingSubTools, DrawingSubToolType } from "../sub-tools/drawing-sub-tools";
import SubTool from "../sub-tools/sub-tool-base";
import { SubToolColor } from "../sub-tools/sub-tool/sub-tool-color";
import { SubToolDashed } from "../sub-tools/sub-tool/sub-tool-dashed";
import { SubToolDotted } from "../sub-tools/sub-tool/sub-tool-dotted";
import { SubToolOpacity } from "../sub-tools/sub-tool/sub-tool-opacity";
import { SubToolSolid } from "../sub-tools/sub-tool/sub-tool-solid";
import { SubToolThickness } from "../sub-tools/sub-tool/sub-tool-thickness";

//lineColor
export function createColorSubTools(toolbarId: string, propertyName: string, parentToolName: string, totalButtons: number, container: HTMLDivElement, subTools: SubTool[],  valueUpdatedCallback?: (value: any) => void){
    const type = DrawingSubTools.get(DrawingSubToolType.Color);
    if(type){
        for(let i = 0; i < totalButtons; i++){
            const subTool = new SubToolColor(toolbarId, propertyName, parentToolName, type.name, type.description, type.icon, i, valueUpdatedCallback);
            setSubToolbarButton(subTool, subTools, container);
        }
    }
}

export function createOpacitySubTools(toolbarId: string, propertyName: string, parentToolName: string, totalButtons: number, container: HTMLDivElement, subTools: SubTool[],  valueUpdatedCallback?: (value: any) => void){
    const type = DrawingSubTools.get(DrawingSubToolType.Opacity);
    if(type){
        for(let i = 0; i < totalButtons; i++){
            const subTool = new SubToolOpacity(toolbarId, propertyName, parentToolName, type.name, type.description, type.icon, i, valueUpdatedCallback);
            setSubToolbarButton(subTool, subTools, container);
        }
    }
}

export function createThicknessSubTools(toolbarId: string, propertyName: string, parentToolName: string, totalButtons: number, container: HTMLDivElement, subTools: SubTool[],  valueUpdatedCallback?: (value: any) => void){
    const type = DrawingSubTools.get(DrawingSubToolType.Thickness);
    if(type){
        for(let i = 0; i < totalButtons; i++){
            const subTool = new SubToolThickness(toolbarId, propertyName, parentToolName, type.name, type.description, type.icon, i, valueUpdatedCallback);
            setSubToolbarButton(subTool, subTools, container);
        }
    }
}

export function createLineStyleSubTools(toolbarId: string, propertyName: string, parentToolName: string, container: HTMLDivElement, subTools: SubTool[],  valueUpdatedCallback?: (value: any) => void){
    let type = DrawingSubTools.get(DrawingSubToolType.Solid);
    if(type){
        const subTool = new SubToolSolid(toolbarId, propertyName, parentToolName, type.name, type.description, type.icon, 0, valueUpdatedCallback);
        setSubToolbarButton(subTool, subTools, container);
    }

    type = DrawingSubTools.get(DrawingSubToolType.Dotted);
    if(type){
        const subTool = new SubToolDotted(toolbarId, propertyName, parentToolName, type.name, type.description, type.icon, 1, valueUpdatedCallback);
        setSubToolbarButton(subTool, subTools, container);
    }

    type = DrawingSubTools.get(DrawingSubToolType.Dashed);
    if(type){
        const subTool = new SubToolDashed(toolbarId, propertyName, parentToolName, type.name, type.description, type.icon, 2, valueUpdatedCallback);
        setSubToolbarButton(subTool, subTools, container);
    }
}