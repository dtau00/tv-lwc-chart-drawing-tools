import { IPrimitivePaneView } from "lightweight-charts";
import { ViewBase } from "../drawings/drawing-view-base";


export class PaneViewBase implements IPrimitivePaneView {
    protected paneViews: ViewBase[] = [];

	constructor() {
	}

	update() {

	}

	renderer() {
        return this.renderer();
	}
}   