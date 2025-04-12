import SubTool from "../../../toolbar/sub-tools/sub-tool-base";
import { DrawingSubToolType } from "../../../toolbar/sub-tools/drawing-sub-tools";

export class SubToolThickness extends SubTool {
    constructor(propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(propertyName, parentTool, 'div', name, description, icon, index, DrawingSubToolType.Thickness, valueUpdatedCallback);

        this._onMouseDown = this._onMouseDown.bind(this);
    }

    init(): void {
        if (this.div instanceof HTMLDivElement) {
            this.div.addEventListener('mousedown', this._onMouseDown);
        }
    }
    
    dispose(): void {
        if (this.div instanceof HTMLDivElement) {
            this.div.removeEventListener('mousedown', this._onMouseDown);
        }
    }

    updateDiv(): void {
        if (!this.div) return
        this.div.style.width = '20px';
        this.div.style.height = '20px';
        this.div.style.borderLeft = `${this.value}px solid #000`;
    }

    private _onMouseDown(evt: MouseEvent): void {
        const index = this.index;
        if (evt.button === 2) { // rclick, TODO open slider
            const thickness = this._getNextThickness();
            console.log('thickness', thickness);
            this.setValue(this._getNextThickness());
            this.setSelectedTool(index);
        }
        if (evt.button === 0) {
            this.setSelectedTool(index);
        }
    }

    private _getNextThickness(): string {
        let val = Number(this.value) + 1
        if (val > 10) val = 1
        return val.toString()
    }
}