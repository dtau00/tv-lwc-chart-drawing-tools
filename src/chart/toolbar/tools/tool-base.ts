
import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import ITool from "./tool-interface";
import { createToolbarButton } from "../../../chart/toolbar/common";
import SubTool from "../sub-tools/sub-tool-base";
import { DataStorage } from "../../../common/storage";
import { toolKeyName } from "../../../common/tool-key";
import { DrawingToolType } from "./drawing-tools";
import { eventBus, ButtonEvents, createToolButtonEventDetails } from "../../../common/event-bus";

abstract class Tool implements ITool {
    button!: HTMLDivElement;
	protected subTools: SubTool[] = [];

	constructor(
		private _toolbarId: string,
		public name: string,
		public description: string,
		public icon: string,
		public toolType: DrawingToolType,
		private _immediatelyStartDrawing: boolean = false,
		private _isGeneralButtonType: boolean = false,
	) {
		this.onClick = this.onClick.bind(this);
	}

    get toolbarId() {return this._toolbarId}
    get immediatelyStartDrawing(){ return this._immediatelyStartDrawing }
    get isGeneralButtonType(){ return this._isGeneralButtonType }

    abstract getNewDrawingObject(chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string): any;
    abstract setSubToolbarButtons(container: HTMLDivElement): void;

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
        eventBus.dispatchEvent(new CustomEvent(ButtonEvents.ToolClicked, createToolButtonEventDetails(this._toolbarId, this.toolType)))
    }

    private _setToolStyleProperties(value: any): void {
        const keyName = toolKeyName(this.name);
        let overrideOptions: Record<string, any> = DataStorage.loadData(keyName, {}) || {};
        overrideOptions[value.property] = value.value;
        DataStorage.saveData(keyName, overrideOptions)
    }
}

export default Tool;