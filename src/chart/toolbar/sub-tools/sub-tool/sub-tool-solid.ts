import { DrawingSubToolType } from "../drawing-sub-tools";
import SubTool from "../sub-tool-base";


export class SubToolSolid extends SubTool {
    constructor(toolbarId: string, propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(toolbarId, propertyName, parentTool, 'div', name, description, icon, index, DrawingSubToolType.Thickness, valueUpdatedCallback);

        this._onMouseDown = this._onMouseDown.bind(this);
    }

    init(): void {
        if (!(this.div instanceof HTMLInputElement)) return;

        this.div.addEventListener('mousedown', this._onMouseDown);
    }
    
    dispose(): void {
        if (!(this.div instanceof HTMLInputElement)) return;

         this.div.removeEventListener('mousedown', this._onMouseDown);
    }

    setButtonStyling(): void {
        if (!this.div) return

        this.div.style.width = '20px';
        this.div.style.height = '20px';
    }

    private _onMouseDown(evt: MouseEvent): void {
        const index = this.index;
        
        if (evt.button === 2) { // rclick, TODO open slider
            this.setValue('');
            this.setSelectedTool(index);
        }
        if (evt.button === 0) {
            this.setValue('');
            this.setSelectedTool(index);
        }
    }
}