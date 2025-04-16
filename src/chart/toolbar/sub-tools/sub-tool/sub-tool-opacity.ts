import SubTool from "../../../toolbar/sub-tools/sub-tool-base";
import { DrawingSubToolType } from "../../../toolbar/sub-tools/drawing-sub-tools";

export class SubToolOpacity extends SubTool {
    constructor(toolbarId: string, propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(toolbarId, propertyName, parentTool, 'div', name, description, icon, index, DrawingSubToolType.Opacity, valueUpdatedCallback);

        this._onMouseDown = this._onMouseDown.bind(this);
    }

    init(): void {
        if (!(this.div instanceof HTMLDivElement)) return;
         this.div.addEventListener('mousedown', this._onMouseDown);
    }
    
    dispose(): void {
        if (!(this.div instanceof HTMLDivElement)) return;
        this.div.removeEventListener('mousedown', this._onMouseDown);
    }

    setButtonStyling(): void {
        if (!this.div) return

        this.div.style.borderRadius = '50%';
        this.div.style.width = '20px';
        this.div.style.height = '20px';
        this.div.style.border = '1px solid #000';
        this.div.style.backgroundColor = 'black';
        this.div.style.opacity = this.value;
    }

    private _onMouseDown(evt: MouseEvent): void {
        const index = this.index;

        if (evt.button === 2) { // rclick, TODO open slider
            this.setValue(this._getNextOpacity());
            this.setSelectedTool(index);
        }
        if (evt.button === 0) {
            this.setSelectedTool(index);
        }
    }

    private _getNextOpacity(): string {
        let val = Number(this.value) + 0.05
        if (val > 1) val = .20
        return val.toString()
    }
}