export function clearDiv(toolbar: HTMLDivElement): void{
    toolbar!.innerHTML = '';
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