
import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import ITool from "./tool-interface";
import { createToolbarButton } from "../../../chart/toolbar/common";
import SubTool from "../sub-tools/sub-tool-base";
import { ConfigStorage } from "../../../common/storage";
import { toolKeyName } from "../../../common/tool-key";
import { DrawingToolType } from "./drawing-tools";
import { eventBus, ButtonEvents, createToolButtonEventDetails } from "../../../common/event-bus";

abstract class Tool implements ITool {
    toolType: DrawingToolType;
    name: string;
    description: string;
    icon: string;
    button: HTMLDivElement;
    private _immediatelyStartDrawing: boolean; // immediately starts drawing after first chart is selected.  Often used for single user input drawings, like vertical line.
    protected subTools: SubTool[] = [];

    constructor(name: string, description: string, icon: string, toolType: DrawingToolType, immediatelyStartDrawing? : boolean) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.toolType = toolType;
        this._immediatelyStartDrawing = immediatelyStartDrawing ?? false

        this.onClick = this.onClick.bind(this);
    }

    get immediatelyStartDrawing(){ return this._immediatelyStartDrawing }

    abstract getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): any;
    abstract setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[];

    dispose(): void {
        this.button.removeEventListener('click', this.onClick);
        this.disposeSubButtons()
    }

    disposeSubButtons(): void {
        this.subTools.forEach(subTool => subTool.dispose());
    }

    addToolButtonToContainer(container: HTMLDivElement): HTMLDivElement {
        this.button = createToolbarButton(this.name, this.description, this.icon, this.name, 'div', container!);
        this.button.addEventListener('click', this.onClick)
        return this.button;
    }

    valueUpdatedCallback = (value: any) => {
        this._setToolStyleProperties(value);
    }

    protected onClick(evt: MouseEvent): void {
        console.log('tool button onClick, sending event', this.toolType)
        eventBus.dispatchEvent(new CustomEvent(ButtonEvents.ToolClicked, createToolButtonEventDetails(this.toolType)))
    }

    private _loadProps(): void {
        //this.options = ConfigStorage.loadConfig(this._keyName(), this.options);
    }

    private _setToolStyleProperties(value: any): void {
        const keyName = toolKeyName(this.name);
        let overrideOptions = ConfigStorage.loadConfig(keyName, {}) || {};
        overrideOptions[value.property] = value.value;
        ConfigStorage.saveConfig(keyName, overrideOptions)
    }
}

export default Tool;