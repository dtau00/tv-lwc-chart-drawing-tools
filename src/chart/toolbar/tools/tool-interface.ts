import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { ChartDrawingBase } from "../../drawings/chart-drawing-base";
interface ITool {
    button: HTMLDivElement;
    name: string;
    description: string;
    icon: string;

    dispose: () => void;
    addToolButtonToContainer: (container: HTMLDivElement) => void;
    getNewDrawingObject: (chart: IChartApi, series: ISeriesApi<SeriesType>, symbolName: string) => ChartDrawingBase;
    setSubToolbarButtons: (container: HTMLDivElement) => HTMLDivElement[];
}

export default ITool;
