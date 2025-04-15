import { DrawingSubToolType } from "../chart/toolbar/sub-tools/drawing-sub-tools";
import { DrawingToolType } from "../chart/toolbar/tools/drawing-tools";

export const eventBus = new EventTarget();

export enum DrawingEvents {//ChartEvents {
    NewDrawingCompleted = 'newDrawingCompleted',
    CompletedDrawingSelected = 'completedDrawingSelected',
    CompletedDrawingUnSelected = 'completedDrawingUnSelected',
}

export interface DrawingEventDetails{
   // toolbarId: string,
    drawingId: string,
    toolType: string,
}

export function createDrawingEventDetails(drawingId: string, toolType: string){
    return {
        detail : {
          //  toolbarId,
            drawingId,
            toolType
        } as DrawingEventDetails
    }
}

export enum ButtonEvents {
    ToolClicked = 'toolClicked',
    SubToolClicked = 'subToolClicked'
}

export interface ToolButtonEventDetails {
    toolbarId: string,
    toolType: DrawingToolType
}

export function createToolButtonEventDetails(toolbarId: string, toolType: DrawingToolType) {
    return {
        detail : {
            toolbarId,
            toolType
        } as ToolButtonEventDetails
    }
}

export interface SubToolButtonEventDetails {
    toolbarId: string,
    toolType: DrawingToolType,
    type: DrawingSubToolType,
    name: string,
    property: string,
    index: number
}

export function createSubToolButtonEventDetails(toolbarId: string, toolType: DrawingToolType, type: DrawingSubToolType, name: string, property: string, index: number) {
    return {
        detail : {
            toolbarId,
            toolType,
            type, 
            name,
            property,
            index
        } as SubToolButtonEventDetails
    }
}