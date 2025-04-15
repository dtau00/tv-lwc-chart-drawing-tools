import { DrawingToolFactory } from "../../common/factories/drawing-tool-type-to-tool-factory";
import { ChartDrawingsToolbar } from "./chart-drawing-toolbar";
import { DrawingToolType, AVAILABLE_TOOLS } from "./tools/drawing-tools";
import Tool from "./tools/tool-base";

// interface for the ChartManager to communicate with
export class ChartDrawingsToolbarManager {

    private _currentToolType: DrawingToolType = DrawingToolType.None;; //Tool;
    private _toolbars: ChartDrawingsToolbar[] = []

	constructor(){

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
}