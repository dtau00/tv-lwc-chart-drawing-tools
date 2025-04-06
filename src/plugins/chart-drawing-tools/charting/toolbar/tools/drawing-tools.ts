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
    LineExtended = 'line-extended',
    //Line = 'line',
    //ExtendedLine = 'extended-line',
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
        type: DrawingToolType.Remove,
        name: 'remove',
        icon: '❌',
        description: 'Remove the last drawing'
    },

    /*
    {
        type: DrawingToolType.Line,
        name: 'Line',
        icon: 'line-tool',
        description: 'Draw lines on the chart'
    },
    {
        type: DrawingToolType.ExtendedLine,
        name: 'ExtendedLine',
        icon: 'extended-line-tool',
        description: 'Draw lines that extends all the way to the right'
    },
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
];


