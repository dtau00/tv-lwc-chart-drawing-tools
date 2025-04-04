
import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { RectangleDrawing } from "../../drawings/rectangle/rectangle-drawing";
import ITool from "./tool-interface";
import { createToolbarButton } from "../common";
import SubTool from "../sub-tools/sub-tool-base";
import { ConfigStorage } from "../../../data/data";
import { toolKeyName } from "../../../common/common";
import { DrawingToolType } from "./drawing-tools";

abstract class Tool implements ITool {
    toolType: DrawingToolType;
    name: string;
    description: string;
    icon: string;
    button: HTMLDivElement;
    protected subTools: SubTool[] = [];
    private _listener: (evt: MouseEvent) => void;

    constructor(name: string, description: string, icon: string, toolType: DrawingToolType) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.toolType = toolType;
    }

    abstract getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): RectangleDrawing;
    abstract setSubToolbarButtons(container: HTMLDivElement): HTMLDivElement[];
    abstract defaultMouseListener(evt: MouseEvent, index?: number): void;

    setToolbarButton(container: HTMLDivElement, listener?: (evt: MouseEvent) => void): HTMLDivElement {
        this._listener = listener || this.defaultMouseListener;
        this.button = createToolbarButton(this.name, this.description, this.icon, (evt: MouseEvent) => this._listener(evt), 'click', container!);
        return this.button;
    }

    dispose(): void {
        this.button.removeEventListener('click', this._listener);
        this.subTools.forEach(subTool => subTool.dispose());
    }

    setProps(value?: any): void {

    }

    valueUpdatedCallback = (value: any) => {
        this._saveProps(value);
    }

    private _loadProps(): void {
        //this.options = ConfigStorage.loadConfig(this._keyName(), this.options);
    }

    private _saveProps(value: any): void {
        const keyName = toolKeyName(this.name);
        let overrideOptions = ConfigStorage.loadConfig(keyName, {}) || {};
        overrideOptions[value.property] = value.value;
        ConfigStorage.saveConfig(keyName, overrideOptions)
    }
}

export default Tool;