export const eventBus = new EventTarget();

export enum ChartEvents {
    NewDrawingCompleted = 'newDrawingCompleted',
    UnsetToolbar = 'unsetToolbar',
    SetToolbarTool = 'setToolbarTool',
    ToolSet = 'toolSet',
    SubToolSet = 'subToolSet',
    CompletedDrawingSelected = 'completedDrawingSelected',
    CompletedDrawingUnSelected = 'completedDrawingUnSelected',
}
