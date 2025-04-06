export interface DrawingToolInfo {
    type: DrawingToolType;
    name: string;
    icon: string;  // CSS class name or icon identifier
    description: string;
}

export enum DrawingToolType {
    Rectangle = 'rectangle',
    RectangleExtended = 'rectangle-extended',
    Line = 'line',
    HorizontalLineRay = 'horizontal-line-ray',
    HorizontalLine = 'horizontal-line',
    VerticalLine = 'vertical-line',
    //Text = 'text',
    //Fibonacci = 'fibonacci',
    Remove = 'remove',
    None = 'none'  // For when no tool is selected
}

export const AVAILABLE_TOOLS: DrawingToolInfo[] = [
    {
        type: DrawingToolType.Rectangle,
        name: 'rectangle',
        icon: '▭',
        description: 'Draw rectangles on the chart'
    },
    {
        type: DrawingToolType.RectangleExtended,
        name: 'rectangle-extended',
        icon: '⌧',
        description: 'Draw rectangles on the chart'
    },
    {
        type: DrawingToolType.Line,
        name: 'line',
        icon: '/',
        description: 'Draw lines on the chart'
    },

    {
        type: DrawingToolType.HorizontalLineRay,
        name: 'horizontal-line-ray',
        icon: ':-',
        description: 'Draw horizontal line rays on the chart'
    },
    {
        type: DrawingToolType.HorizontalLine,
        name: 'horizontal-line',
        icon: '─',
        description: 'Draw horizontal lines on the chart'
    },
    {
        type: DrawingToolType.VerticalLine,
        name: 'vertical-line',
        icon: ' | ',
        description: 'Draw vertical lines on the chart'
    },
    /*
    {
        type: DrawingToolType.Text,
        name: 'Text',
        icon: 'text-tool',
        description: 'Add text annotations'
    },

    {
        type: DrawingToolType.Fibonacci,
        name: 'Fibonacci',
        icon: 'fibonacci-tool',
        description: 'Draw Fibonacci retracement levels'
    }*/
    {
        type: DrawingToolType.Remove,
        name: 'remove',
        icon: '❌',
        description: 'Remove the last drawing'
    },
];


