interface ISubTool {
    div: HTMLDivElement;
    name: string;
    description: string;
    icon: string;
    value: any;
    parentTool: string;
    
    init(): void;
    dispose(): void;
    setButtonStyling: () => void;
    addToolButtonToContainer: (container: HTMLDivElement) => void;
}

export default ISubTool;
