export interface DrawingStyle {
    color: string;
    lineWidth?: number;
    fillColor?: string;
    opacity?: number;
}

export interface DrawingToolInfo {
    type: DrawingToolType;
    name: string;
    icon: string;  // CSS class name or icon identifier
    description: string;
}

export enum DrawingToolType {
    Rectangle = 'rectangle',
    Remove = 'remove',
    //ExtendedRectangle = 'extended-rectangle',
    //Line = 'line',
    //ExtendedLine = 'extended-line',
    //Text = 'text',
    //Fibonacci = 'fibonacci',
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
        type: DrawingToolType.Remove,
        name: 'remove',
        icon: '❌',
        description: 'Remove the last drawing'
    },
    /*
    {
        type: DrawingToolType.ExtendedRectang
        name: 'ExtendedRectangle',
        icon: 'extended-rectangle-tool',
        description: 'Draws rectangles that extends all the way to the right'
    },
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


