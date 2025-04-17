import { DataStorage } from "../../../common/storage";
import { DrawingSubTools, DrawingSubToolType } from "./drawing-sub-tools";
import { unselectAllDivsForGroup } from "../../../common/utils/html";
import { createSubToolbarButton, ToolbarButton } from "../../../chart/toolbar/common";
import ISubTool from "./sub-tool-interface";
import { ButtonEvents, createSubToolButtonEventDetails, eventBus } from '../../../common/event-bus';
import { subToolKeyName, subToolValueKeyName } from "../../../common/tool-key";
import { DrawingToolType } from "../tools/drawing-tools";

abstract class SubTool implements ISubTool {
    private _div!: HTMLDivElement | HTMLInputElement;
    private _container!: HTMLDivElement;
    private _value: any;

    constructor(
        private _toolbarId: string,
        private _propertyName: string,
        private _parentTool: string,
        private _buttonType: ToolbarButton,
        private _name: string,
        private _description: string,
        private _icon: string,
        private _index: number,
        private _type: DrawingSubToolType,
        private _valueUpdatedCallback?: (value: any) => void
    ) {
        this._loadValue();
        this.setValue(this._value, false);
    }

    get toolbarId(): string { return this._toolbarId; }
    get value(): any { return this._value; }
    get name(): string { return this._name; }
    get description(): string { return this._description; }
    get icon(): string { return this._icon; }
    get div(): HTMLDivElement | HTMLInputElement { return this._div; }
    get type(): DrawingSubToolType { return this._type; }
    get parentTool(): string { return this._parentTool; }
    get buttonType(): ToolbarButton { return this._buttonType; }
    get index(): number { return this._index; }

    abstract init(): void;
    abstract dispose(): void
    abstract setButtonStyling(): void;;
    
    addToolButtonToContainer(container: HTMLDivElement): void {
        this._container = container;
        this._div = createSubToolbarButton(this._name, this._description, this._icon, this._propertyName, this._buttonType, container!);
        this.setButtonStyling()
    }

    setValue(value?: any, initiateCallback: boolean = true): void {
        let val = value || this._value;

        // TODO this is hacky, val is string, but sometimes it's a number
        if (val === undefined || val === null || Number.isNaN(val) || val === 'NaN')
            this._saveValue(this._getDefaultValue());
        else
            this._saveValue(val);
        
        this.setButtonStyling();
    }

    getValue(){
        return DataStorage.loadData(this._keyName(), this._value);
    }

    setSelectedStyling(): void {
        const key = this._subToolKeyName()
        const selectIndex = Number(localStorage.getItem(key))
        if (!isNaN(selectIndex) && selectIndex === this._index) {
            this.div.classList.add('selected');
        }
    }

    protected setSelectedTool(index?: number): void {
        this._setSelectedSubToolStylingForTool(); // set styling
        this._saveSelectedSubToolIndex(index!); // save the selected index for future ref
        this._initiateValueUpdatedCallback(); // send the value back to the parent tool
        const toolType = DrawingToolType[this._parentTool  as keyof typeof DrawingToolType] // TODO i should just be passing the DrawingToolType rather than a string
        const eventDetails = createSubToolButtonEventDetails(this.toolbarId, toolType, this._type, this._name, this._propertyName, this._index)
        eventBus.dispatchEvent(new CustomEvent(ButtonEvents.SubToolClicked, eventDetails));
    }

    // TODO its a bit wierd to do this here
    private _setSelectedSubToolStylingForTool(){
        unselectAllDivsForGroup(this._container!, [this._propertyName]);
        this.div.classList.add('selected');
    }

    // send selected values back to parent tool
    private _initiateValueUpdatedCallback = (): void => {
        if(!this._valueUpdatedCallback) return;

        const val = {
            property: this._propertyName,
            value: this.value,
        }
        this._valueUpdatedCallback(val);
    }

    private _saveSelectedSubToolIndex(index : number){
        localStorage.setItem(this._subToolKeyName(), index.toString() || '');
    }

    private _saveValue(value: any): void {
        this._value = value;
        DataStorage.saveData(this._keyName(), this._value);
    }

    private _loadValue(): void {
       this._value = this.getValue()
    }

    private _getDefaultValue(): any {
        let val 
        let drawingSubTool = DrawingSubTools.get(this._type);
        if (drawingSubTool)
            val = drawingSubTool.defaultValue;
        return val;
    }

    private _keyName(): string {
        return subToolValueKeyName(this._parentTool,this._propertyName,this._index)
    }

    private _subToolKeyName(): string {
        return subToolKeyName(this._parentTool,this._propertyName)
    }
}

export default SubTool;