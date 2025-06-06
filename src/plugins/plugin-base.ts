import {
	DataChangedScope,
	IChartApi,
	ISeriesApi,
	ISeriesPrimitive,
	SeriesAttachedParameter,
	SeriesOptionsMap,
	Time,
} from 'lightweight-charts';
import { ensureDefined } from '../common/utils/assertions';
import { generateUniqueId } from '../common/utils/id-generator';

export abstract class PluginBase implements ISeriesPrimitive<Time> {
	private _baseId: string = generateUniqueId('plugin-base-');

	protected _chart: IChartApi | undefined = undefined;
	protected _series: ISeriesApi<keyof SeriesOptionsMap> | undefined = undefined;
	
	get baseId(): string { return this._baseId; }

	public attached({ chart, series, requestUpdate }: SeriesAttachedParameter<Time>) {
		this._chart = chart;
		this._series = series;
		this._series.subscribeDataChanged(this._fireDataUpdated);
		this._requestUpdate = requestUpdate;
		this.requestUpdate();
	}

	public detached() {
		this._series?.unsubscribeDataChanged(this._fireDataUpdated);
		this._chart = undefined;
		this._series = undefined;
		this._requestUpdate = undefined;
	}

	public get chart(): IChartApi {
		return ensureDefined(this._chart);
	}

	public get series(): ISeriesApi<keyof SeriesOptionsMap> {
		return ensureDefined(this._series);
	}

	protected dataUpdated?(scope: DataChangedScope): void;
	protected requestUpdate(): void {
		if (this._requestUpdate) this._requestUpdate();
	}

	private _requestUpdate?: () => void;

	// This method is a class property to maintain the
	// lexical 'this' scope (due to the use of the arrow function)
	// and to ensure its reference stays the same, so we can unsubscribe later.
	private _fireDataUpdated = (scope: DataChangedScope) => {
		if (this.dataUpdated) {
			this.dataUpdated(scope);
		}
	}
}
