import { DrawingToolType } from "../../chart/toolbar/tools/drawing-tools";
import { ToolFibonacci } from "../../chart/toolbar/tools/tool/tool-fibonacci";
import { ToolLine } from "../../chart/toolbar/tools/tool/tool-line";
import { ToolLineHorizontal } from "../../chart/toolbar/tools/tool/tool-line-horizontal";
import { ToolLineHorizontalRay } from "../../chart/toolbar/tools/tool/tool-line-horizontal-ray";
import { ToolLineVertical } from "../../chart/toolbar/tools/tool/tool-line-vertical";
import { ToolRectangle } from "../../chart/toolbar/tools/tool/tool-rectangle";
import { ToolRectangleExtended } from "../../chart/toolbar/tools/tool/tool-rectangle-extended";
import { ToolRemove } from "../../chart/toolbar/tools/tool/tool-remove";
import { ToolRemoveAll } from "../../chart/toolbar/tools/tool/tool-remove-all";
import { ToolText } from "../../chart/toolbar/tools/tool/tool-text";

// all built in drawing tools
/*
export const DrawingToolFactory =  new Map([
    [DrawingToolType.Fibonacci, ToolFibonacci],
    [DrawingToolType.Rectangle, ToolRectangle],
    [DrawingToolType.RectangleExtended, ToolRectangleExtended],
    [DrawingToolType.Line, ToolLine],
    [DrawingToolType.HorizontalLineRay, ToolLineHorizontalRay],
    [DrawingToolType.HorizontalLine, ToolLineHorizontal],
    [DrawingToolType.VerticalLine, ToolLineVertical],
    [DrawingToolType.Text, ToolText],
    [DrawingToolType.Remove, ToolRemove],
    [DrawingToolType.RemoveAll, ToolRemoveAll],
]);*/

// I'm not sure why removing the generaldrawingtools from here 
export const DrawingToolFactory =  new Map([
    [DrawingToolType.Fibonacci, ToolFibonacci],
    [DrawingToolType.Rectangle, ToolRectangle],
    [DrawingToolType.RectangleExtended, ToolRectangleExtended],
    [DrawingToolType.Line, ToolLine],
    [DrawingToolType.HorizontalLineRay, ToolLineHorizontalRay],
    [DrawingToolType.HorizontalLine, ToolLineHorizontal],
    [DrawingToolType.VerticalLine, ToolLineVertical],
    [DrawingToolType.Text, ToolText],
    [DrawingToolType.Remove, ToolRemove],
    [DrawingToolType.RemoveAll, ToolRemoveAll],
])