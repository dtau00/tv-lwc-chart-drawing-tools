import { mergeOpacityIntoRgba } from '../../common/utils/rgba-string';
import { DrawingPoint, MousePointAndTime } from '../../common/points';
import {  removeUndefinedKeys } from '../../common/utils/objects'
import { toolKeyName } from '../../common/tool-key'
import { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import { PluginBase } from '../../plugins/plugin-base';
import { DrawingToolType } from '../toolbar/tools/drawing-tools';
import { DataStorage } from '../../common/storage';
import { PaneViewBase } from './drawing-pane-view-base';

// Base class for all drawing views, handles the style options and updates
export class ViewBase extends PluginBase {
    private _baseStyleOptions: {}; // base style, the one that's saved
    private _defaultStyleOptions: {}; // default style
    private _toolType: DrawingToolType;
    private _drawingId: string;

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
        drawingId: string
	) {
		super();
        this._drawingId = drawingId
        this._chart = chart,
        this._series = series,
        this._toolType = toolType;
        this._defaultStyleOptions = defaultOptions;
        this._options = this.isEmpty(options) ? {...defaultOptions, ...this.getStyleOptions()} : {...defaultOptions, ...options};
        this._baseStyleOptions = this._options;
	}

    get drawingId(): string {return this._drawingId}

    getOverrideOptions(toolType: DrawingToolType, styleOptions: {}): any {
        const keyName = toolKeyName(toolType);
        //const overrides = isEmpty(styleOptions) ? ConfigStorage.loadConfig(keyName, {}) as Partial<T> : styleOptions;
        const overrides = this.isEmpty(styleOptions) ? DataStorage.loadData(keyName, {}) : styleOptions;
        return overrides;
    }

    applyOptions(options: {}) {
        this._options = { ...this._options, ...options };
        this.requestUpdate();
    }

    setBaseStyleOptions(options?: {}) : {} {
        this._baseStyleOptions = { ...this._baseStyleOptions, ...options };
        this.applyOptions(this._baseStyleOptions);
        return  this._baseStyleOptions
    }

    setBaseStyleOptionsFromConfig() : {} {
        const options = this.transformRgbaOptions({});
        return this.setBaseStyleOptions(options);
    }

    // internal system often uses rgba to apply opacity, rather than the opacity property, so heres
    // a helper to merge the two color and opacity values into rgba, or returns default
    getRgbaOverrideColorFromOptions<T>(toolType: DrawingToolType, colorPropertyName: string, opacityPropertyName: string, defaultOptions: Partial<T>, overrideOptions?: Partial<T>){
        let overrides = overrideOptions ?? this.getOverrideOptions(toolType, this._baseStyleOptions)
        if((overrides as any)[colorPropertyName] && (overrides as any)[opacityPropertyName]){
            //console.log('mergeOpacityIntoRgba', (overrides as any)[colorPropertyName], (overrides as any)[opacityPropertyName])
            overrides[colorPropertyName] = mergeOpacityIntoRgba((overrides as any)[colorPropertyName], (overrides as any)[opacityPropertyName]);
        }

        return overrides[colorPropertyName] || defaultOptions[colorPropertyName as keyof T];
    }

    transformRgbaOptions(styleOptions: {}): any {
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

    // update the points for the drawing, make sure you pass in the correct number of points
    // TODO enforce the proper number of points
    updatePoints(points: DrawingPoint[]) {
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

    getStyleOptions(): any {
        return this.transformRgbaOptions(this._baseStyleOptions);
    }

    initializeDrawingViews(points: DrawingPoint[]): void{
        throw new Error("Method not implemented.  Overwrite this methods in your class.");
    }

    updateInitialPoint(p: DrawingPoint, param: MousePointAndTime){
        throw new Error("Method not implemented.  Overwrite this methods in your class.");
    }

    protected updateInitialPointForRectangle(p: DrawingPoint, param: MousePointAndTime) {
        if(!this.points[0]) return;

        this.points[0] = p;
        this._paneViews[0].update();
        super.requestUpdate();
    }
}