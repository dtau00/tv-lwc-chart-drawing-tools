import { isValidDashFormat } from "../../../../common/utils/dash-format-string";
import { DrawingSubToolType } from "../drawing-sub-tools";
import SubTool from "../sub-tool-base";

const dotValues = ['[1,1]','[1,2]','[1,3]','[1,4]','[1,5]','[2,2]','[2,3]','[2,4]','[2,5]']

export class SubToolDotted extends SubTool {
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
        let index = dotValues.indexOf(this.getValue())
        index = (index < 0 || index >= dotValues.length - 1) ? 0 : index + 1
        return dotValues[index]
    }
}