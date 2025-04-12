import SubTool from "../../../toolbar/sub-tools/sub-tool-base";
import { DrawingSubToolType } from "../../../toolbar/sub-tools/drawing-sub-tools";
import { hexToRgba, rgbaStringToColorInputHex } from "../../common";

export class SubToolColor extends SubTool {
    private _openColorPickerToggle: boolean = false;
    private _lastSelectedIndex: number = 0;

    constructor(propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(propertyName, parentTool, 'color', name, description, icon, index, DrawingSubToolType.Color, valueUpdatedCallback);

        this._onMouseDown = this._onMouseDown.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onClick = this._onClick.bind(this);
    }

    init(): void {
        if (this.div instanceof HTMLInputElement) {
            this.div.addEventListener('change', this._onChange);
            this.div.addEventListener('click', this._onClick);
            this.div.addEventListener('mousedown', this._onMouseDown);
        }
    }
    
    dispose(): void {
        if (this.div instanceof HTMLInputElement) {
            this.div.removeEventListener('change', this._onChange);
            this.div.removeEventListener('click', this._onClick);
            this.div.removeEventListener('mousedown', this._onMouseDown);
        }
    }
    
    updateDiv(): void {
        if (this.div && this.div instanceof HTMLInputElement) {
            //this.div.style.borderRadius = '50%';
            this.div.style.width = '22px';
            this.div.style.height = '20px';
            this.div.value = rgbaStringToColorInputHex(this.value) || '';
        }
    }

    private _onChange(evt: Event): void {
        if (this.div instanceof HTMLInputElement) {
            const colorValue = this.div.value;
            const rgba = hexToRgba(colorValue);
           console.log('rgba',colorValue, rgba)
            this.setValue(rgba);
            this.setSelectedTool(this._lastSelectedIndex);
            this.updateDiv();
        }
    }

    private _onClick(evt: MouseEvent): void {
        if(this._openColorPickerToggle){ // hack to open color wheel on rclick
            this._openColorPickerToggle = false;
        }
        else{
            evt.preventDefault();
        }
    }

    private _onMouseDown(evt: MouseEvent): void {
        const index = this.index;
        // if rclick, open color picker
        this._lastSelectedIndex = index ?? 0;
        if (evt.button === 0) { // left click
            this.setSelectedTool(index);
        }
        if (evt.button === 2) { // rclick, open color wheel
            this.setSelectedTool(index);
            this._openColorPickerToggle = true;
            console.log('open color picker', this._openColorPickerToggle)
            this.div.click();
        }
    }
}