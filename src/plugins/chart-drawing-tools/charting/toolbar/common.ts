import SubTool from "./sub-tools/sub-tool-base";

export function createToolbarButton(name: string, description: string, icon: string, listener: (evt: MouseEvent) => void, eventType: 'click' | 'mousedown' | 'mouseup' = 'click', container?: HTMLDivElement): HTMLDivElement {
    const button = document.createElement('div');
    button.className = `toolbar-item ${name}`;
    button.title = description;
    button.innerHTML = icon;
    button.addEventListener(eventType, listener);
    if(container)
        container.appendChild(button);
    return button;
}

export function setSubToolbarButton(subTool: SubTool, subTools: SubTool[], container: HTMLDivElement){
    subTool.setToolbarButton(container); 
    subTools.push(subTool);
    subTool.setSelectedStyling();
}
