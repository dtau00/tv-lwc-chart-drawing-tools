import { ConfigStorage } from "../../../data/data";
import { DrawingSubTools, DrawingSubToolType } from "./drawing-sub-tools";
import { unselectAllDivsForGroup } from "../../../common/html.ts";
import { createToolbarButton } from "../common.ts";
import ISubTool from "./sub-tool-interface";
import { eventBus } from "../../../common/common";
import { ChartEvents } from "../../../enums/events";

abstract class SubTool implements ISubTool {
    private _div: HTMLDivElement;
    private _name: string;
    private _description: string;
    private _icon: string;
    private _index: number;
    private _value: any;
    private _parentTool: string;
    private _type: DrawingSubToolType;
    private _propertyName: string;
    private _container: HTMLDivElement;
    private _mouseListener: (evt: MouseEvent) => void;
    private _valueUpdatedCallback?: (value: any) => void;

    get value(): any { return this._value; }
    get name(): string { return this._name; }
    get description(): string { return this._description; }
    get icon(): string { return this._icon; }
    get div(): HTMLDivElement { return this._div; }
    get type(): DrawingSubToolType { return this._type; }
    get parentTool(): string { return this._parentTool; }

    constructor(propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, type: DrawingSubToolType, valueUpdatedCallback?: (value: any) => void) {
        this._name = name;
        this._description = description;
        this._icon = icon;
        this._index = index;
        this._type = type;
        this._parentTool = parentTool;
        this._propertyName = propertyName;
        this._valueUpdatedCallback = valueUpdatedCallback;

        this._loadValue();
        this.setValue(this._value, false);
    }

    abstract updateDiv(): void;
    abstract mouseListener(evt: MouseEvent, index?: number): void;

    setToolbarButton(container: HTMLDivElement): void {
        this._container = container;
        this._div = createToolbarButton(this._name, this._description, this._icon, (evt: MouseEvent) => this.mouseListener(evt, this._index), 'mousedown', container!);
        this.updateDiv()
    }

    dispose(): void {
        this._div.removeEventListener('mousedown', this.mouseListener);
    }

    setValue(value?: any, initiateCallback: boolean = true): void {
        let val = value || this._value;

        // TODO this is hacky, val is string, but sometimes it's a number
        if (val === undefined || val === null || Number.isNaN(val) || val === 'NaN')
            this._saveValue(this._getDefaultValue());
        else
            this._saveValue(val);
        
        this.updateDiv();
    }

    initiateValueUpdatedCallback = (): void => {
        if (this._valueUpdatedCallback) {
            const val = {
                property: this._propertyName,
                value: this.value,
            }
            this._valueUpdatedCallback(val);
        }
    }

    public setSelectedStyling(): void {
        const key = this._subToolKeyName()
        const selectIndex = Number(localStorage.getItem(key))
        if (!isNaN(selectIndex) && selectIndex === this._index) {
            this.div.classList.add('selected');
        }
    }

    protected setSelectedTool(index?: number): void {
        localStorage.setItem(this._subToolKeyName(), index?.toString() || '');
        unselectAllDivsForGroup(this._container!, [this.type]);
        this.div.classList.add('selected');
        this.initiateValueUpdatedCallback()
        eventBus.dispatchEvent(new CustomEvent(ChartEvents.SubToolSet, { detail: { type : this.type, index : this._index, name : this._name, property : this._propertyName } }));
    }

    protected _saveValue(value: any): void {
        this._value = value;
        ConfigStorage.saveConfig(this._keyName(), this._value);
    }

    private _getDefaultValue(): void {
        let val 
        let drawingSubTool = DrawingSubTools.get(this._type);
        if (drawingSubTool)
            val = drawingSubTool.defaultValue;
        return val;
    }

    private _keyName(): string {
        return `subtool_val_${this._name}_${this._index}`;
    }

    private _subToolKeyName(): string {
        return `selected-subtool-${this._parentTool}-${this._propertyName}`;
    }

    private _loadValue(): void {
        this._value = ConfigStorage.loadConfig(this._keyName(), this._value);
    }
}
export default SubTool;



