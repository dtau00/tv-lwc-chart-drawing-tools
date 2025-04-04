import SubTool from "../base/sub-tool-base";
import { DrawingSubToolType } from "../drawing-sub-tools";

export class SubToolOpacity extends SubTool {
    constructor(propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(propertyName, parentTool, name, description, icon, index, DrawingSubToolType.Opacity, valueUpdatedCallback);
    }

    mouseListener(evt: MouseEvent, index?: number): void {
        if (evt.button === 2) { // rclick, TODO open slider
            this.setValue(this._getNextOpacity());
            this.setSelectedTool(index);
        }
        if (evt.button === 0) {
            this.setSelectedTool(index);
        }
    }

    updateDiv(): void {
        if (!this.div) return
        this.div.style.borderRadius = '50%';
        this.div.style.width = '20px';
        this.div.style.height = '15px';
        this.div.style.border = '1px solid #000';
        this.div.style.backgroundColor = 'black';
        this.div.style.opacity = this.value;
    }

    private _getNextOpacity(): string {
        let val = Number(this.value) + 0.05
        if (val > 1) val = 0
        return val.toString()
    }
}