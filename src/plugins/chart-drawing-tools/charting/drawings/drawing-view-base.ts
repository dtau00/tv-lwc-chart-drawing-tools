import { mergeOpacityIntoRgba } from '../../common/helper';
import { DrawingPoint, toolKeyName } from '../../common/common';
import { IChartApi, ISeriesApi, MouseEventParams, SeriesType } from 'lightweight-charts';
import { PluginBase } from '../../../plugin-base';
import { DrawingToolType } from '../toolbar/tools/drawing-tools';
import { ConfigStorage } from '../../data/data';
import { removeUndefinedKeys } from '../../common/helper';
import { PaneViewBase } from './drawing-pane-view-base';

// Base class for all drawing views, handles the style options and updates
export class ViewBase extends PluginBase {
    private _baseStyleOptions: {}; // base style, the one that's saved
    private _defaultStyleOptions: {}; // default style
    private _toolType: DrawingToolType;

    protected _paneViews: PaneViewBase[] = [];

    public points: DrawingPoint[] = [];
    public _options: {}; // active style, could temporarily be different (like from selection)

    isEmpty = (obj: object) => !obj ||Object.keys(obj).length === 0;

	constructor(
		chart: IChartApi,
		series: ISeriesApi<SeriesType>,
        toolType: DrawingToolType,
		defaultOptions: {},
		options: {},
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

        public setBaseStyleOptions(options?: {}) : {} {
            this._baseStyleOptions = { ...this._baseStyleOptions, ...options };
            this.applyOptions(this._baseStyleOptions);
            return  this._baseStyleOptions
        }

        public setBaseStyleOptionsFromConfig() : {} {
            const options = this.transformRgbaOptions({});
            return this.setBaseStyleOptions(options);
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
            let overrides = this.getOverrideOptions(this._toolType, styleOptions);
        
            // Automatically update all rgba-style fields based on associated opacity keys
            for (const key of Object.keys(overrides)) {
                if (
                    typeof overrides[key] === 'string' &&
                    overrides[key].startsWith('rgba') &&
                    !key.includes('Opacity')
                ) {
                    // Build the expected opacity key name
                    const opacityKey = `${key}Opacity`;
                    overrides[key] = this.getRgbaOverrideColorFromOptions(
                        this._toolType,
                        key,
                        opacityKey,
                        this._defaultStyleOptions,
                        overrides
                    );
                }
            }
        
            overrides = removeUndefinedKeys(overrides);
            return overrides;
        }

        updateInitialPoint(p: DrawingPoint, param: MouseEventParams) {
            if(this.points[0]){
                this.points[0] = p;
                this._paneViews[0].update();
                super.requestUpdate();
            }
        }
    
        // update the points for the drawing, make sure you pass in the correct number of points
        // TODO enforce the proper number of points
        public updatePoints(points: DrawingPoint[]) {
            this.points = points;
            this._paneViews[0].update();
            super.requestUpdate();
        }
    
        updateAllViews() {
            this._paneViews.forEach(pv => pv.update());
        }
    
        paneViews() {
            return this._paneViews;
        }
    
        public getStyleOptions(): any {
            return this.transformRgbaOptions(this._baseStyleOptions);
        }

        public initializeDrawingViews(points: DrawingPoint[]): void{
            throw new Error("Method not implemented.  Overrite this methods in your class.");
        }
    }