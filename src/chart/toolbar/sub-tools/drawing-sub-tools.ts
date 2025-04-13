export interface DrawingSubToolInfo {
    name: string; // also the prop name
    icon: string;  // CSS class name or icon identifier
    description: string;
    defaultValue: any;
}

export enum DrawingSubToolType {
    Color = 'color',
    Opacity = 'opacity',
    Thickness = 'thickness',
    Solid = 'solid',
    Dotted = 'dotted',
    Dashed = 'dashed',
}

export const DrawingSubTools: Map<DrawingSubToolType, DrawingSubToolInfo> = new Map([
    [DrawingSubToolType.Color, {
        name: 'color',
        icon: '',
        description: 'Color of drawing.  Right click to change color.',
        defaultValue: 'rgba(255, 116, 108, 1)'
    }],
    [DrawingSubToolType.Opacity, {
        name: 'opacity',
        icon: '',
        description: 'Transparency of drawing.  Right click to change transparency level.',
        defaultValue: 0.75
    }],
    [DrawingSubToolType.Thickness, {
        name: 'thickness',
        icon: '',
        description: 'Thickness of drawing.  Right click to change thickness.',
        defaultValue: 2
    }],
    [DrawingSubToolType.Solid, {
        name: 'solid',
        icon: '─',
        description: 'Line style of the drawing.',
        defaultValue: 'solid'
    }],
    [DrawingSubToolType.Dotted, {
        name: 'dotted',
        icon: '…',
        description: 'Line style of the drawing.',
        defaultValue: '[2,2]'
    }],
    [DrawingSubToolType.Dashed, {
        name: 'dashed',
        icon: '¦',
        description: 'Line style of the drawing.',
        defaultValue: '[5,2]'
    }]
]);


