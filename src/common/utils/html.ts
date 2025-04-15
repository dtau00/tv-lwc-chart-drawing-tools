export function clearDiv(div: HTMLDivElement): void{
    div!.innerHTML = '';
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

export function createSpacer(): HTMLSpanElement {
    const spacer = document.createElement('span');
    spacer.style.width = '5px';
    spacer.style.display = 'inline-block';
    spacer.style.textAlign = 'center';
    spacer.style.verticalAlign = 'top';
    return spacer;
}
