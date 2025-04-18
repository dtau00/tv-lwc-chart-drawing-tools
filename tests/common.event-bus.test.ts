
// eventBus.test.ts

import {
    eventBus,
    DrawingEvents,
    DrawingEventDetails,
    createDrawingEventDetails,
    ButtonEvents,
    ToolButtonEventDetails,
    createToolButtonEventDetails,
    SubToolButtonEventDetails,
    createSubToolButtonEventDetails
} from '../src/common/event-bus'; 

import { DrawingSubToolType } from "../src/chart/toolbar/sub-tools/drawing-sub-tools"; 
import { DrawingToolType } from "../src/chart/toolbar/tools/drawing-tools";       
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Event Bus and Event Creators', () => {

    // --- Test Factory Functions ---

    describe('createDrawingEventDetails', () => {
        it('should create correct event details structure', () => {
            const drawingId = 'drawing-abc';
            const toolType = DrawingToolType.Line; // Use imported or mocked enum
            const expectedDetails: DrawingEventDetails = { drawingId, toolType };

            const eventInit = createDrawingEventDetails(drawingId, toolType);

            expect(eventInit).toEqual({ detail: expectedDetails });
        });
    });

    describe('createToolButtonEventDetails', () => {
        it('should create correct event details structure', () => {
            const toolbarId = 'toolbar-main';
            const toolType = DrawingToolType.Fibonacci; // Use imported or mocked enum
            const expectedDetails: ToolButtonEventDetails = { toolbarId, toolType };

            const eventInit = createToolButtonEventDetails(toolbarId, toolType);

            expect(eventInit).toEqual({ detail: expectedDetails });
        });
    });

    describe('createSubToolButtonEventDetails', () => {
        it('should create correct event details structure', () => {
            const toolbarId = 'toolbar-secondary';
            const toolType = DrawingToolType.Line;
            const type = DrawingSubToolType.Color; // Use imported or mocked enum
            const name = 'Line Color';
            const property = 'stroke';
            const index = 0;

            const expectedDetails: SubToolButtonEventDetails = {
                toolbarId,
                toolType,
                type,
                name,
                property,
                index
            };

            const eventInit = createSubToolButtonEventDetails(toolbarId, toolType, type, name, property, index);

            expect(eventInit).toEqual({ detail: expectedDetails });
        });
    });

    // --- Test Event Bus Functionality ---

    describe('eventBus', () => {
        let listenerMock: ReturnType<typeof vi.fn>; // Type inference for mockt.Mock;

        beforeEach(() => {
            // Create a fresh mock for each test
            listenerMock = vi.fn();
        });

        afterEach(() => {
            // Vitest might alrealdy handle this but being explicit, cleaning up listeners
            eventBus.removeEventListener(DrawingEvents.NewDrawingCompleted, listenerMock);
            eventBus.removeEventListener(ButtonEvents.ToolClicked, listenerMock);
        });

        it('should allow adding an event listener and triggering it', () => {
            const drawingId = 'draw-1';
            const toolType = DrawingToolType.Line;
            const eventDetails = createDrawingEventDetails(drawingId, toolType);

            eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, listenerMock);
            eventBus.dispatchEvent(new CustomEvent(DrawingEvents.NewDrawingCompleted, eventDetails));

            expect(listenerMock).toHaveBeenCalledTimes(1);
            // Check if the listener was called with an event object containing the correct details
            expect(listenerMock).toHaveBeenCalledWith(expect.objectContaining({
                detail: eventDetails.detail
            }));
        });

        it('should allow adding multiple listeners for the same event', () => {
            const listenerMock2 = vi.fn();
            const eventDetails = createDrawingEventDetails('draw-2', DrawingToolType.Line);

            eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, listenerMock);
            eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, listenerMock2);
            eventBus.dispatchEvent(new CustomEvent(DrawingEvents.NewDrawingCompleted, eventDetails));

            expect(listenerMock).toHaveBeenCalledTimes(1);
            expect(listenerMock2).toHaveBeenCalledTimes(1);
        });

        it('should only trigger listeners for the specific event dispatched', () => {
            const drawingEventDetails = createDrawingEventDetails('draw-3', DrawingToolType.Line);
            const toolButtonEventDetails = createToolButtonEventDetails('tb-1', DrawingToolType.Fibonacci);

            eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, listenerMock); // Listener for drawing event
            eventBus.dispatchEvent(new CustomEvent(ButtonEvents.ToolClicked, toolButtonEventDetails)); // Dispatch button event

            expect(listenerMock).not.toHaveBeenCalled();

            eventBus.dispatchEvent(new CustomEvent(DrawingEvents.NewDrawingCompleted, drawingEventDetails)); // Dispatch drawing event
            expect(listenerMock).toHaveBeenCalledTimes(1);
             expect(listenerMock).toHaveBeenCalledWith(expect.objectContaining({
                detail: drawingEventDetails.detail
            }));
        });

        it('should allow removing an event listener', () => {
             const eventDetails = createDrawingEventDetails('draw-4', DrawingToolType.Line);

            eventBus.addEventListener(DrawingEvents.NewDrawingCompleted, listenerMock);
            eventBus.removeEventListener(DrawingEvents.NewDrawingCompleted, listenerMock); // Remove the listener
            eventBus.dispatchEvent(new CustomEvent(DrawingEvents.NewDrawingCompleted, eventDetails));

            expect(listenerMock).not.toHaveBeenCalled();
        });

         it('should handle different event types and details correctly', () => {
            const subToolDetails = createSubToolButtonEventDetails('tb-2', DrawingToolType.Line, DrawingSubToolType.Color, 'color', 'color', 1);

            eventBus.addEventListener(ButtonEvents.SubToolClicked, listenerMock);
            eventBus.dispatchEvent(new CustomEvent(ButtonEvents.SubToolClicked, subToolDetails));

            expect(listenerMock).toHaveBeenCalledTimes(1);
            expect(listenerMock).toHaveBeenCalledWith(expect.objectContaining({
                detail: subToolDetails.detail
            }));
         });
    });
});