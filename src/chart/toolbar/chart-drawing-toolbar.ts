import { DrawingToolType, AVAILABLE_TOOLS } from '../toolbar/tools/drawing-tools';
import { clearDiv } from '../../common/utils/html';
import Tool from '../toolbar/tools/tool-base';
import { ChartDrawingBase } from '../drawings/chart-drawing-base';
import { DrawingToolFactory } from '../../common/factories/drawing-tool-type-to-tool-factory';
import { generateUniqueId } from '../../common/utils/id-generator';

export class ChartDrawingsToolbar {
	private _tools: Map<DrawingToolType, Tool> = new Map();
	private _currentTool!: Tool | null; // current tool selected on the toolbar.  We keep a ref to this to use later, because it holds all the divs for the buttons

	constructor(
		private _drawingsToolbarContainer: HTMLDivElement,
		private _drawingsSubToolbarContainer: HTMLDivElement,
		private _toolbarId?: string,
		// TODO: in the future a user can pass a list of tools they want activated for this toolbar
	) {
		// genearte an id if one isn't provided.  the toolbar is usually tied to the chartid, but can also be floating
		this._toolbarId = _toolbarId ?? generateUniqueId('toolbarId-');
		
		this._initializeToolbar();
		this._initializeMouseEvents();
	}

	get initialized() {return this._tools.size > 0}
	get toolbarId() {return this._toolbarId ?? ''}
	get toolbarContainer() { return this._drawingsToolbarContainer}
	get subToolbarContainer() { return this._drawingsSubToolbarContainer}
	get tools(){ return this._tools}
	get currentTool() { return this._currentTool }

	// TODO: dispose should be called when the chart is destroyed
	public dispose(){
		this._drawingsToolbarContainer?.removeEventListener("contextmenu", this._disableRightClick);
		this._drawingsSubToolbarContainer?.removeEventListener("contextmenu", this._disableRightClick);
		
		for(const tool of this._tools.values()){
			tool.dispose();
		}
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
	}

	private _initializeDrawingTools(): void {
		if(this.initialized) return; // only initialize once, or we will have multiple listeners on the same button

		AVAILABLE_TOOLS.forEach(tool => {
			const toolClass = DrawingToolFactory.get(tool.type);
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
