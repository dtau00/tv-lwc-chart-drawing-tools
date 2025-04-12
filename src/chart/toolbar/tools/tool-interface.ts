import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { ChartDrawingBase } from "../../drawings/chart-drawing-base";
interface ITool {
    button: HTMLDivElement;
    name: string;
    description: string;
    icon: string;

    setToolbarButton: (container: HTMLDivElement, listener?: (evt: MouseEvent) => void) => void;
    getNewDrawingObject: (chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string) => ChartDrawingBase;
    setSubToolbarButtons: (container: HTMLDivElement) => HTMLDivElement[];
    dispose: () => void;
}

export default ITool;
