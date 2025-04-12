export function toolKeyName(name: string): string {
	return `tool_options_override_${name}`;
}

export function subToolKeyName(parentTool : string, propertyName : string): string {
    return `selected-subtool-${parentTool}-${propertyName}`;
   // return `selected-subtool-${this._parentTool}-${this._propertyName}`;
}

export function subToolValueKeyName(parentTool : string, propertyName : string, index : number){
    return `subtool-val-${parentTool}-${propertyName}-${index}`;
   // return `subtool-val-${this._parentTool}-${this._propertyName}-${this._index}`;
}