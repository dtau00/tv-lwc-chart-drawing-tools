import { isValidDashFormat } from "../../../../common/utils/dash-format-string";
import { DrawingSubToolType } from "../drawing-sub-tools";
import SubTool from "../sub-tool-base";

const DASH_VALUES = ['[5,2]','[5,3]','[5,4]','[5,5]','[10,4]','[10,6]','[10,8]','[10,10]','[10,12]']

export class SubToolDashed extends SubTool {
    constructor(toolbarId: string, propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(toolbarId, propertyName, parentTool, 'div', name, description, icon, index, DrawingSubToolType.Thickness, valueUpdatedCallback);

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
        
        this.div.style.width = '20px';
        this.div.style.height = '20px';
    }

    private _onMouseDown(evt: MouseEvent): void {
        const index = this.index;
        
        if (evt.button === 2) { // rclick, TODO open slider
            this.setValue(this._getNextValue());
            this.setSelectedTool(index);
        }
        if (evt.button === 0) {
            if(!isValidDashFormat( this.getValue()))
                this.setValue(this._getNextValue())
            this.setSelectedTool(index);
        }
    }

    private _getNextValue(){
        let index = DASH_VALUES.indexOf(this.getValue())
        index = (index < 0 || index >= DASH_VALUES.length - 1) ? 0 : index + 1
        return DASH_VALUES[index]
    }
}