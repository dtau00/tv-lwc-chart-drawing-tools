/**
 * standarizes tool key name to be used as an identifying  key for the tool
 * @param toolName name of tool
 * @returns standardized key name
 */
export function toolKeyName(toolName: string): string {
    if (typeof toolName !== 'string' || !toolName.trim()) throw new Error('Invalid name: must be a non-empty string')
    return `tool_options_override_${toolName}`
  }
  
  /**
   * standarizes sub tool key name to be used as an identifying  key for the tool
   * @param parentToolName 
   * @param propertyName property name of the drawing the subtool is configuring for
   * @returns standardized key name
   */
  export function subToolKeyName(parentToolName: string, propertyName: string): string {
    if (!parentToolName?.trim()) throw new Error('Invalid parentTool: must be a non-empty string')
    if (!propertyName?.trim()) throw new Error('Invalid propertyName: must be a non-empty string')

    return `selected-subtool-${parentToolName}-${propertyName}`
  }
  
  /**
   * standarizes sub tool's value key name to be used as an identifying  key for the tool
   * @param parentToolName 
   * @param propertyName property name of the drawing the subtool is configuring for
   * @param index index of the subtool (since a group of subtools may be configuing the same property)
   * @returns standardized key name
   */
  export function subToolValueKeyName(parentToolName: string, propertyName: string, index: number): string {
    if (!parentToolName?.trim()) throw new Error('Invalid parentTool: must be a non-empty string')
    if (!propertyName?.trim()) throw new Error('Invalid propertyName: must be a non-empty string')
    if (!Number.isInteger(index) || index < 0) throw new Error('Invalid index: must be a non-negative integer')

    return `subtool-val-${parentToolName}-${propertyName}-${index}`
  }