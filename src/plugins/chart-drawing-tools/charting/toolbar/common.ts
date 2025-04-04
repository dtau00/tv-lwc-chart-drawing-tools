export function clearToolbar(toolbar: HTMLDivElement): void{
    toolbar!.innerHTML = '';
}

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

export function selectDivForGroup(container: HTMLDivElement, names: string[], targetName: string): void {
    const elem = container?.querySelector(`.${names.find(t =>t  === targetName)}`)
    elem?.classList.add('selected');
}

export function unselectAllDivsForGroup(container: HTMLDivElement, names: string[]): void {
    if(!container) return;
    for(const name of names){
        const elems = container?.querySelectorAll(`.${name}`);
        for(const elem of elems){
            elem?.classList.remove('selected');
        }
    }
}