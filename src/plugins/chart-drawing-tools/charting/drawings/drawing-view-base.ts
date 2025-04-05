import { mergeOpacityIntoRgba } from '../../common/helper';
import { toolKeyName } from '../../common/common';
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { PluginBase } from '../../../plugin-base';
import { DrawingToolType } from '../toolbar/tools/drawing-tools';
import { ConfigStorage } from '../../data/data';
import { removeUndefinedKeys } from '../../common/helper';

// Base class for all drawing views, handles the style options and updates
export class ViewBase extends PluginBase {
	protected initalized: boolean = false;
    private _baseStyleOptions: {}; // base style, the one that's saved
	private _options: {}; // active style, could temporarily be different (like from selection)
    private _defaultStyleOptions: {}; // default style
    private _toolType: DrawingToolType;
    isEmpty = (obj: object) => !obj ||Object.keys(obj).length === 0;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
        toolType: DrawingToolType,
		defaultOptions: {},
		options: {}
	) {
		super();
        this._chart = chart,
        this._series = series,
        this._toolType = toolType;
        this._defaultStyleOptions = defaultOptions;
        this._options = this.isEmpty(options) ? {...defaultOptions, ...this.getStyleOptions()} : {...defaultOptions, ...options};
        this._baseStyleOptions = this._options;
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
            this.applyOptions(this._baseStyleOptions);
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
            overrides.fillColor = this.getRgbaOverrideColorFromOptions(this._toolType, 'fillColor', 'fillColorOpacity', this._defaultStyleOptions, overrides);
            overrides.color = this.getRgbaOverrideColorFromOptions(this._toolType, 'color', 'colorOpacity', this._defaultStyleOptions, overrides);
            overrides = removeUndefinedKeys(overrides);
            return overrides;
        }
    
        public getStyleOptions(): any {
            return this.transformRgbaOptions(this._baseStyleOptions);
        }


    }