interface ISubTool {
    div: HTMLDivElement;
    name: string;
    description: string;
    icon: string;
    value: any;
    parentTool: string;
    
    mouseListener: (evt: MouseEvent, index?: number) => void;
    setToolbarButton: (container: HTMLDivElement, listener?: (evt: MouseEvent) => void) => void;
    updateDiv: () => void;
    dispose(): void;
}

export default ISubTool;
