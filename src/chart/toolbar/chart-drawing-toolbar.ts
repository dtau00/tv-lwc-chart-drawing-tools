import { DrawingToolType, AVAILABLE_TOOLS } from '../toolbar/tools/drawing-tools.ts';
import { clearDiv, unselectAllDivsForGroup } from '../../common/utils/html.ts';
import Tool from '../toolbar/tools/tool-base.ts';
import { ChartDrawingBase } from '../drawings/chart-drawing-base.ts';
import { DrawingToolFactory } from '../../common/factories/drawing-tool-type-to-tool-factory.ts';
import { generateUniqueId } from '../../common/utils/id-generator.ts';

export class ChartDrawingsToolbar {
	private _drawingsToolbarContainer: HTMLDivElement | undefined;
	private _drawingsSubToolbarContainer: HTMLDivElement | undefined;
	private _tools: Map<DrawingToolType, Tool> = new Map();
	private _toolButtons: Map<HTMLDivElement, EventListener> = new Map();
	private _initialized: boolean = false;
	private _toolbarId: string; // chartId is often used here to link with chart
	private _toolFactory = DrawingToolFactory;
	private _currentTool: Tool | null; // current tool selected on the toolbar.  We keep a ref to this to use later, because it holds all the divs for the buttons

	constructor(
		drawingsToolbarContainer: HTMLDivElement,
		drawingsSubToolbarContainer: HTMLDivElement,
		toolbarId?: string,
	) {
		this._toolbarId = toolbarId ?? generateUniqueId('toolbarId-');
		this._drawingsToolbarContainer = drawingsToolbarContainer;
		this._drawingsSubToolbarContainer = drawingsSubToolbarContainer;

		this._initializeToolbar();
		this._initializeMouseEvents();
	}

	get toolbarId() {return this._toolbarId}
	get toolbarContainer() { return this._drawingsToolbarContainer}
	get subToolbarContainer() { return this._drawingsSubToolbarContainer}
	get tools(){ return this._tools}
	get currentTool() { return this._currentTool }

	// TODO: dispose should be called when the chart is destroyed
	public dispose(){
		this._drawingsToolbarContainer?.removeEventListener("contextmenu", this._disableRightClick);
		this._drawingsSubToolbarContainer?.removeEventListener("contextmenu", this._disableRightClick);
		//this._removeButton?.removeEventListener('click', this._onClickRemoveDrawingTool);
		
		// todo verify events are being removed
		this._toolButtons.forEach((handler, button) => {
			button.removeEventListener('click', handler);
		});
	
		this._toolButtons.clear();
		this._tools.clear();
	}

	removeSubToolbar(toolType: DrawingToolType): void {
		this._currentTool?.disposeSubButtons();
		//unselectAllDivsForGroup(this._drawingsSubToolbarContainer)
		clearDiv(this._drawingsSubToolbarContainer!); // clear the sub toolbar
	}

	activateTool(toolType: DrawingToolType): void {
		this.removeSubToolbar(toolType);
		this._currentTool = this._tools.get(toolType) ?? null;
		this._currentTool?.setSubToolbarButtons(this._drawingsSubToolbarContainer!) ?? []; // populate the sub toolbar
	}

	openModifyDrawingToolbar(drawing: ChartDrawingBase): void {
		this.activateTool(drawing.type)
	}

	private _initializeMouseEvents(){
		this._drawingsToolbarContainer?.addEventListener("contextmenu", this._disableRightClick); // we want to change behavior of right click on toolbar
		this._drawingsSubToolbarContainer?.addEventListener("contextmenu", this._disableRightClick); // we want to change behavior of right click on toolbar
	}

	private _initializeToolbar() {
		if (!this._drawingsToolbarContainer) return;
		
		this._initializeDrawingTools();
		this._initialized = true;
	}

	private _initializeDrawingTools(): void {
		if(this._initialized) return; // only initialize once, or we will have multiple listeners on the same button

		AVAILABLE_TOOLS.forEach(tool => {
			const toolClass = this._toolFactory.get(tool.type);
			if(!toolClass || tool.type === DrawingToolType.None) 
				return;

			// if its not a general tool, that its a tool
			const ToolClass = toolClass//this._generalToolMap[tool.type] ?? toolClass;
			const t = new ToolClass(this.toolbarId, tool.name, tool.description, tool.icon, tool.type);
			t.addToolButtonToContainer(this._drawingsToolbarContainer!);
			this._tools.set(tool.type, t);
		});
	}

	// events and listeners ------------------------------------------------------------
	private _disableRightClick(evt: MouseEvent): void {
		evt.preventDefault();
	}
}
