import { mergeOpacityIntoRgba } from '../../common/helper';
import { DrawingPoint, toolKeyName } from '../../common/common';
import { IChartApi, ISeriesApi, MouseEventParams, SeriesType } from 'lightweight-charts';
import { PluginBase } from '../../../plugin-base';
import { DrawingToolType } from '../toolbar/tools/drawing-tools';
import { ConfigStorage } from '../../data/data';
import { removeUndefinedKeys } from '../../common/helper';
import { ChartDrawingBaseProps } from './chart-drawing-base';

// Base class for all drawing views, handles the style options and updates
export class ViewBase extends PluginBase {
    private _baseStyleOptions: {}; // base style, the one that's saved
    private _defaultStyleOptions: {}; // default style
    private _toolType: DrawingToolType;
    private _baseProps: ChartDrawingBaseProps;

	protected initalized: boolean = false;

    public _options: {}; // active style, could temporarily be different (like from selection)

    isEmpty = (obj: object) => !obj ||Object.keys(obj).length === 0;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
        toolType: DrawingToolType,
		defaultOptions: {},
		options: {},
        baseProps: ChartDrawingBaseProps,
	) {
		super();
        this._chart = chart,
        this._series = series,
        this._toolType = toolType;
        this._defaultStyleOptions = defaultOptions;
        this._options = this.isEmpty(options) ? {...defaultOptions, ...this.getStyleOptions()} : {...defaultOptions, ...options};
        this._baseStyleOptions = this._options;
        this._baseProps = baseProps;
	}
        public updatePoints(points: DrawingPoint[]){
            throw new Error("Method not implemented.  Overrite this methods in your class.");
        }

        public getOverrideOptions(toolType: DrawingToolType, styleOptions: {}): any {
            const keyName = toolKeyName(toolType);
            //const overrides = isEmpty(styleOptions) ? ConfigStorage.loadConfig(keyName, {}) as Partial<T> : styleOptions;
            const overrides = this.isEmpty(styleOptions) ? ConfigStorage.loadConfig(keyName, {}) : styleOptions;
            return overrides;
        }
    
        public applyOptions(options: {}) {
            this._options = { ...this._options, ...options };
            this.requestUpdate();
        }

        public setBaseStyleOptions(options?: {}) {
            this._baseStyleOptions = { ...this._baseStyleOptions, ...options };
            this._baseProps.styleOptions = this._baseStyleOptions;
            this.applyOptions(this._baseStyleOptions);
        }

        public setBaseStyleOptionsFromConfig() {
            const options = this.transformRgbaOptions({});
            this.setBaseStyleOptions(options);
        }

        // internal system often uses rgba to apply opacity, rather than the opacity property, so heres
        // a helper to merge the two color and opacity values into rgba, or returns default
        public getRgbaOverrideColorFromOptions<T>(toolType: DrawingToolType, colorPropertyName: string, opacityPropertyName: string, defaultOptions: Partial<T>, overrideOptions?: Partial<T>){
            let overrides = overrideOptions ?? this.getOverrideOptions(toolType, this._baseStyleOptions)
            if((overrides as any)[colorPropertyName] && (overrides as any)[opacityPropertyName]){
                console.log('mergeOpacityIntoRgba', (overrides as any)[colorPropertyName], (overrides as any)[opacityPropertyName])
                overrides[colorPropertyName] = mergeOpacityIntoRgba((overrides as any)[colorPropertyName], (overrides as any)[opacityPropertyName]);
            }
            return overrides[colorPropertyName] || defaultOptions[colorPropertyName];
        }
    
        public transformRgbaOptions(styleOptions: {}): any {
            let  overrides = this.getOverrideOptions(this._toolType, styleOptions);
    
            // TODO fill this out with more rgba color properties
            // TODO just look for the setting, and see if there's an xxxOpacity setting with it
            overrides.fillColor = this.getRgbaOverrideColorFromOptions(this._toolType, 'fillColor', 'fillColorOpacity', this._defaultStyleOptions, overrides);
            overrides.color = this.getRgbaOverrideColorFromOptions(this._toolType, 'lineColor', 'lineColorOpacity', this._defaultStyleOptions, overrides);
            overrides = removeUndefinedKeys(overrides);
            return overrides;
        }
    
        public getStyleOptions(): any {
            return this.transformRgbaOptions(this._baseStyleOptions);
        }

        public initializeDrawingViews(points: DrawingPoint[]): void{
            throw new Error("Method not implemented.  Overrite this methods in your class.");
        }

        public updateInitialPoint(p: DrawingPoint, param: MouseEventParams) {
            throw new Error("Method not implemented.  Overrite this methods in your class.");
        }

/*
        const onVisibleLogicalRangeChanged = (newVisibleLogicalRange: LogicalRange | null) => {
            if (!chartBarSeriesRef.current) return;
            
            const barsInfo = chartBarSeriesRef.current.barsInLogicalRange(newVisibleLogicalRange as Range);
            if (!barsInfo) return;
            
            // Calculate timeInterval to sum and calculate correct dates
            const timeInterval = convertIntervalToSeconds(interval);
            const { barsAfter, to } = barsInfo; // Current chart visibility
            
            if (barsAfter < 0) {
            const newMaxTime = (to as number) + Math.round(-1 * barsAfter) * timeInterval;
            if (newMaxTime > maxVisibleRange) {
            // Load more white space bars
            setMaxVisibleRange(newMaxTime);
            }
            }
            };
            
            ...
            
            useEffect(() => {
            const timeInterval = convertIntervalToSeconds(interval);
            const currenData: BarData[] = JSON.parse(JSON.stringify(candles));
            if (!currenData.length) return;
            
            const newData = [];
            const lastCandleTime = currenData[currenData.length - 1].time as number;
            // Add whitespace bars after the current data
            for (let t = lastCandleTime + timeInterval; t <= maxVisibleRange; t += timeInterval) {
            const whitespaceBar = { time: t as Time };
            newData.push(whitespaceBar);
            }
            
            // We just want to fit content on the 1st time candles are loaded
            // newData should only be filled after onVisibleLogicalRangeChanged
            if (!newData.length) {
            chartInstanceRef.current?.timeScale().fitContent();
            }
            
            chartBarSeriesRef.current?.setData([...currenData, ...newData]);
            }, [maxVisibleRange, interval, candles]);`*/
    }