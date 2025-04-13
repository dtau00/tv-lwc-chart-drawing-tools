import { DrawingSubToolType } from "../chart/toolbar/sub-tools/drawing-sub-tools";
import { DrawingToolType } from "../chart/toolbar/tools/drawing-tools";

export const eventBus = new EventTarget();

export enum ChartEvents {
    NewDrawingCompleted = 'newDrawingCompleted',
    UnsetToolbar = 'unsetToolbar',
    SetToolbar = 'setToolbar',
    CompletedDrawingSelected = 'completedDrawingSelected',
    CompletedDrawingUnSelected = 'completedDrawingUnSelected',
}

export enum ButtonEvents {
    ToolClicked = 'toolClicked',
    SubToolClicked = 'subToolClicked'
}

export interface ToolButtonEventDetails {
    toolType : DrawingToolType
}
export function createToolButtonEventDetails(toolType: DrawingToolType) {
    return {
        detail : {
            toolType
        } as ToolButtonEventDetails
    }
}

export interface SubToolButtonEventDetails {
    toolType : DrawingToolType,
    type : DrawingSubToolType,
    name: string,
    property: string,
    index: number
}

export function createSubToolButtonEventDetails(toolType: DrawingToolType, type: DrawingSubToolType, name: string, property: string, index: number) {
    return {
        detail : {
            toolType,
            type, 
            name,
            property,
            index
        } as SubToolButtonEventDetails
    }
}