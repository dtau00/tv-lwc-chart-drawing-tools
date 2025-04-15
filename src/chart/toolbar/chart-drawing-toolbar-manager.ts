import { DrawingToolFactory } from "../../common/factories/drawing-tool-type-to-tool-factory";
import { ChartDrawingsToolbar } from "./chart-drawing-toolbar";
import { DrawingToolType, AVAILABLE_TOOLS } from "./tools/drawing-tools";
import Tool from "./tools/tool-base";

// interface for the ChartManager to communicate with
export class ChartDrawingsToolbarManager {

    private _currentToolType: DrawingToolType = DrawingToolType.None;; //Tool;
    private _toolbars: ChartDrawingsToolbar[] = []

	constructor(){
        //this._initializeDrawingTools()
    }

    get currentToolType(): DrawingToolType {return this._currentToolType }//?.toolType ?? DrawingToolType.None}

    addToolbar(toolbarDivContainer: HTMLDivElement, subToolbarDivContainer: HTMLDivElement, chartId?: string){
        const toolbar = new ChartDrawingsToolbar(toolbarDivContainer, subToolbarDivContainer, chartId);
        this._toolbars.push(toolbar)
    }

    disposeToolbar(toolbarId: string){
        const index = this._toolbars.findIndex(o => o.toolbarId === toolbarId)
        if(index != -1){
            this._toolbars[index].dispose()
            this._toolbars.splice(index, 1)
        }
    }

    setToolbar(toolbarId: string){
        const toolbar = this.getToolbar(toolbarId)
        if(!toolbar) return;

        toolbar.activateTool(this.currentToolType)
    }

    unsetToolbar(toolbarId: string){
        const toolbar = this.getToolbar(toolbarId)
        if(!toolbar) return;

        toolbar.removeSubToolbar(this.currentToolType)
        document.body.style.cursor = 'default';
    }

    getToolbar(toolbarId: string): ChartDrawingsToolbar | undefined{
        return this._toolbars.find(o => o.toolbarId === toolbarId)
    }

    setCurrentToolType(toolType: DrawingToolType){
        this._currentToolType = toolType;
    }


/*
    private _initializeDrawingTools(): void {
		//if(this._initialized) return; // only initialize once, or we will have multiple listeners on the same button

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
	}*/
}