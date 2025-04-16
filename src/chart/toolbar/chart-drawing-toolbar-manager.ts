import { ChartDrawingsToolbar } from "./chart-drawing-toolbar";
import { DrawingToolType } from "./tools/drawing-tools";

// interface for the ChartManager to communicate with
export class ChartDrawingsToolbarManager {

    private _currentToolType: DrawingToolType = DrawingToolType.None;; //Tool;
    private _toolbars: ChartDrawingsToolbar[] = []

	constructor(){

    }

    get currentToolType(): DrawingToolType {return this._currentToolType }//?.toolType ?? DrawingToolType.None}

    registerToolbar(toolbarDivContainer: HTMLDivElement, subToolbarDivContainer: HTMLDivElement, chartId?: string){
        const toolbar = new ChartDrawingsToolbar(toolbarDivContainer, subToolbarDivContainer, chartId);
        this._toolbars.push(toolbar)
    }

    disposeToolbar(toolbarId: string){
        const index = this._toolbars.findIndex(o => o.toolbarId === toolbarId)
        if(index === -1) return;

        this._toolbars[index].dispose()
        this._toolbars.splice(index, 1)
    }

    activateToolbar(toolbarId: string){
        const toolbar = this.getToolbar(toolbarId)
        if(!toolbar) return;

        toolbar.activateTool(this.currentToolType)
    }

    deactivateToolbar(toolbarId: string){
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