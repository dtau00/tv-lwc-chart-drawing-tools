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
    //Circle = 'circle',
    Fibonacci = 'fibonacci',
    Remove = 'remove',
    RemoveAll = 'remove-all',
    None = 'none'  // For when no tool is selected
}

// Make sure the name  matches the enum value above, and capitalization
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
        icon: '→',
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
        name: 'text',
        icon: 'text-tool',
        description: 'Add text annotations'
    },
    {
        type: DrawingToolType.Circle,
        name: 'circle',
        icon: 'text-tool',
        description: 'Draw a circle'
    },
    
    */

    {
        type: DrawingToolType.Fibonacci,
        name: 'fibonacci',
        icon: '୭',
        description: 'Draw Fibonacci retracement levels'
    },
    {
        type: DrawingToolType.Remove,
        name: 'remove',
        icon: '🗑️',
        description: 'Remove the selected drawing'
    },
    {
        type: DrawingToolType.RemoveAll,
        name: 'remove',
        icon: '❌',
        description: 'Remove all drawings for the symbol'
    },
];


