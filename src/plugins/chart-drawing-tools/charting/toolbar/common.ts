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

