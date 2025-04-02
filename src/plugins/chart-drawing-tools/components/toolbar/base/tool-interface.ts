import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { RectangleDrawing } from "../../../drawings/rectangle/rectangle-drawing";
interface ITool {
    button: HTMLDivElement;
    name: string;
    description: string;
    icon: string;

    setToolbarButton: (container: HTMLDivElement, listener?: (evt: MouseEvent) => void) => void;
    getNewDrawingObject: (chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string) => RectangleDrawing;
    setSubToolbarButtons: (container: HTMLDivElement) => HTMLDivElement[];
    defaultMouseListener: (evt: MouseEvent) => void;
    dispose: () => void;
}

export default ITool;
