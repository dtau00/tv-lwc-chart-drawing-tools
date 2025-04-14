import { DrawingToolType } from "../../chart/toolbar/tools/drawing-tools";
import { ToolFibonacci } from "../../chart/toolbar/tools/tool/tool-fibonacci";
import { ToolLine } from "../../chart/toolbar/tools/tool/tool-line";
import { ToolLineHorizontal } from "../../chart/toolbar/tools/tool/tool-line-horizontal";
import { ToolLineHorizontalRay } from "../../chart/toolbar/tools/tool/tool-line-horizontal-ray";
import { ToolLineVertical } from "../../chart/toolbar/tools/tool/tool-line-vertical";
import { ToolRectangle } from "../../chart/toolbar/tools/tool/tool-rectangle";
import { ToolRectangleExtended } from "../../chart/toolbar/tools/tool/tool-rectangle-extended";
import { ToolRectangleLine } from "../../chart/toolbar/tools/tool/tool-rectangle-line";
import { ToolRectangleLineExtended } from "../../chart/toolbar/tools/tool/tool-rectangle-line-extended";
import { ToolRemove } from "../../chart/toolbar/tools/tool/tool-remove";
import { ToolRemoveAll } from "../../chart/toolbar/tools/tool/tool-remove-all";
import { ToolText } from "../../chart/toolbar/tools/tool/tool-text";

// I'm not sure why removing the generaldrawingtools from here 
export const DrawingToolFactory =  new Map([
    [DrawingToolType.Fibonacci, ToolFibonacci],
    [DrawingToolType.Rectangle, ToolRectangle],
    [DrawingToolType.RectangleExtended, ToolRectangleExtended],
    [DrawingToolType.RectangleLine, ToolRectangleLine],
    [DrawingToolType.RectangleLineExtended, ToolRectangleLineExtended],
    [DrawingToolType.Line, ToolLine],
    [DrawingToolType.HorizontalLineRay, ToolLineHorizontalRay],
    [DrawingToolType.HorizontalLine, ToolLineHorizontal],
    [DrawingToolType.VerticalLine, ToolLineVertical],
    [DrawingToolType.Text, ToolText],
    [DrawingToolType.Remove, ToolRemove],
    [DrawingToolType.RemoveAll, ToolRemoveAll],
])