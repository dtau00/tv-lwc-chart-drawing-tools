import { DrawingSubToolType } from "../chart/toolbar/sub-tools/drawing-sub-tools";
import { DrawingToolType } from "../chart/toolbar/tools/drawing-tools";

// --- Core Event Bus ---
// The central event target for dispatching and listening to application events.
export const eventBus = new EventTarget();

// --- Drawing Events ---
// Events related to the lifecycle of drawings on the chart.

export enum DrawingEvents {
    NewDrawingCompleted = 'newDrawingCompleted',
    CompletedDrawingSelected = 'completedDrawingSelected',
    CompletedDrawingUnSelected = 'completedDrawingUnSelected',
}

/**
 * Details for events related to specific drawing instances.
 */
export interface DrawingEventDetails {
    // toolbarId: string; // Consider if this is needed or remove
    drawingId: string;
    toolType: string; // Could potentially be DrawingToolType if always applicable
}

/**
 * Factory function to create the event detail payload for DrawingEvents.
 * Use this when dispatching events via `eventBus.dispatchEvent(new CustomEvent(DrawingEvents.SomeEvent, createDrawingEventDetails(...)))`.
 */
export function createDrawingEventDetails(drawingId: string, toolType: string): CustomEventInit<DrawingEventDetails> {
    return {
        detail: {
            // toolbarId,
            drawingId,
            toolType
        }
        // No need for 'as DrawingEventDetails' here, TypeScript infers it.
    };
}


// --- Toolbar Button Events ---
// Events related to user interactions with toolbar buttons.

export enum ButtonEvents {
    ToolClicked = 'toolClicked',      // Fired when a main tool button is clicked
    SubToolClicked = 'subToolClicked' // Fired when a sub-tool option (like color, width) is clicked
}

/**
 * Details for events when a main tool button is clicked.
 */
export interface ToolButtonEventDetails {
    toolbarId: string;
    toolType: DrawingToolType;
}

/**
 * Factory function to create the event detail payload for ButtonEvents.ToolClicked.
 */
export function createToolButtonEventDetails(toolbarId: string, toolType: DrawingToolType): CustomEventInit<ToolButtonEventDetails> {
    return {
        detail: {
            toolbarId,
            toolType
        }
    };
}

/**
 * Details for events when a sub-tool button (e.g., color, line style) is clicked.
 */
export interface SubToolButtonEventDetails {
    toolbarId: string;
    toolType: DrawingToolType; // The main tool this sub-tool belongs to
    type: DrawingSubToolType;  // The type of sub-tool (e.g., color, width)
    name: string;              //  Name of subtool
    property: string;          // The specific property being changed (e.g., "strokeWidth", "fill")
    index: number;             // Index of the subtool within the group (the color subtool may have 3 different buttons to choose from)
}

/**
 * Factory function to create the event detail payload for ButtonEvents.SubToolClicked.
 */
export function createSubToolButtonEventDetails(
    toolbarId: string,
    toolType: DrawingToolType,
    type: DrawingSubToolType,
    name: string,
    property: string,
    index: number
): CustomEventInit<SubToolButtonEventDetails> {
    return {
        detail: {
            toolbarId,
            toolType,
            type,
            name,
            property,
            index
        }
    };
}

// --- Example Usage (Conceptual) ---
/*
function handleNewDrawing(event: CustomEvent<DrawingEventDetails>) {
    console.log("New drawing completed:", event.detail.drawingId, event.detail.toolType);
}

function handleToolClick(event: CustomEvent<ToolButtonEventDetails>) {
    console.log("Tool clicked:", event.detail.toolbarId, event.detail.toolType);
}

eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, handleNewDrawing as EventListener);
eventBus.addEventListener(ButtonEvents.ToolClicked, handleToolClick as EventListener);

// Somewhere else in the code:
// eventBus.dispatchEvent(new CustomEvent(DrawingEvents.NewDrawingCompleted, createDrawingEventDetails('drawing-123', DrawingToolType.TrendLine)));
// eventBus.dispatchEvent(new CustomEvent(ButtonEvents.ToolClicked, createToolButtonEventDetails('main-toolbar', DrawingToolType.FibRetracement)));
*/