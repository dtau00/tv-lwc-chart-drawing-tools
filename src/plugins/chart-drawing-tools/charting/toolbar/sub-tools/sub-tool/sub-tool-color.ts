import SubTool from "../sub-tool-base";
import { DrawingSubToolType } from "../drawing-sub-tools";
import { hexToRgba, rgbaStringToColorInputHex } from "../../common";

export class SubToolColor extends SubTool {
    private _openColorPickerToggle: boolean = false;
    private _lastSelectedIndex: number = 0;

    constructor(propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(propertyName, parentTool, 'color', name, description, icon, index, DrawingSubToolType.Color, valueUpdatedCallback);
    }

    init(): void {
        if (this.div instanceof HTMLInputElement) {
            this.div.addEventListener('change', (event) => this.onChange(event));
            this.div.addEventListener('click', (event) => this.onClick(event));
        }
        super.init();
    }
    
    dispose(): void {
        if (this.div instanceof HTMLInputElement) {
            this.div.removeEventListener('change', this.onChange);
            this.div.removeEventListener('click', this.onClick);
        }
        super.dispose();
    }
    
    onChange(evt: Event): void {
        if (this.div instanceof HTMLInputElement) {
            const colorValue = this.div.value;
            const rgba = hexToRgba(colorValue);
           console.log('rgba',colorValue, rgba)
            this.setValue(rgba);
            this.setSelectedTool(this._lastSelectedIndex);
            this.updateDiv();
        }
    }

    onClick(evt: MouseEvent): void {
        if(this._openColorPickerToggle){ // hack to open color wheel on rclick
            this._openColorPickerToggle = false;
        }
        else{
            evt.preventDefault();
        }
    }

    mouseListener(evt: MouseEvent, index?: number): void {
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

    updateDiv(): void {
        if (!this.div) return
        //this.div.style.borderRadius = '50%';
        this.div.style.width = '22px';
        this.div.style.height = '20px';

        if (this.div instanceof HTMLInputElement) {
            const hex = rgbaStringToColorInputHex(this.value) || '';
            this.div.value = hex
            //this.div.style.backgroundColor = hex;
        }
    }
}