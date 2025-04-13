export interface DrawingSubToolInfo {
    type: DrawingSubToolType;
    name: string; // also the prop name
    icon: string;  // CSS class name or icon identifier
    description: string;
    defaultValue: any;
}

export enum DrawingSubToolType {
    Color = 'color',
    Opacity = 'opacity',
    Thickness = 'thickness',
}

export const DrawingSubTools: Map<DrawingSubToolType, DrawingSubToolInfo> = new Map([
    [DrawingSubToolType.Color, {
        type: DrawingSubToolType.Color,
        name: 'color',
        icon: '',
        description: 'Color of drawing.  Right click to change color.',
        defaultValue: 'rgba(255, 116, 108, 1)'
    }],
    [DrawingSubToolType.Opacity, {
        type: DrawingSubToolType.Opacity,
        name: 'opacity',
        icon: '',
        description: 'Transparency of drawing.  Right click to change transparency level.',
        defaultValue: 0.75
    }],
    [DrawingSubToolType.Thickness, {
        type: DrawingSubToolType.Thickness,
        name: 'thickness',
        icon: '',
        description: 'Thickness of drawing.  Right click to change thickness.',
        defaultValue: 2
    }]
]);


