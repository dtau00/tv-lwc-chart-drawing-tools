import SubTool from "../sub-tool-base";
import { DrawingSubToolType } from "../drawing-sub-tools";

export class SubToolThickness extends SubTool {
    constructor(propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(propertyName, parentTool, name, description, icon, index, DrawingSubToolType.Thickness, valueUpdatedCallback);
    }

    mouseListener(evt: MouseEvent, index?: number): void {
        if (evt.button === 2) { // rclick, TODO open slider
            this.setValue(this._getNextThickness());
            this.setSelectedTool(index);
        }
        if (evt.button === 0) {
            this.setSelectedTool(index);
        }
    }

    updateDiv(): void {
        if (!this.div) return
        this.div.style.width = '100%';
        this.div.style.height = '2px';
        this.div.style.border = `${this.value}px solid #000`;
    }

    private _getNextThickness(): string {
        let val = Number(this.value) + 1
        if (val > 10) val = 1
        return val.toString()
    }
}