import SubTool from "../toolbar/sub-tools/sub-tool-base";

export type ToolbarButton = 'div' | 'color'

// TODO make this configurable
const toolButtonWidth = '15px';
const toolButtonHeight = '20px;'

export function createSubToolbarButton(name: string, description: string, icon: string, type: ToolbarButton, container?: HTMLDivElement): HTMLDivElement | HTMLInputElement {
  //return createToolbarButton(name, description, icon, type, () => void 0, '', container);
    return createToolbarButton(name, description, icon, type, container!);
}
/*
export function createToolbarButton_(name: string, description: string, icon: string, type: ToolbarButton, listener: (evt: MouseEvent) => void, eventType: 'click' | 'mousedown' | 'mouseup' | '' = '', container?: HTMLDivElement): HTMLDivElement | HTMLInputElement {
  let div : HTMLInputElement | HTMLDivElement

  if(type === 'color'){
      div = document.createElement('input') as HTMLInputElement;
      if (div instanceof HTMLInputElement) { // make sure TS knows the type
        div.type = 'color';
        div.style.border = 'none';
        if(eventType) {// TODO move this down to base properties.  There's a type issue
          div.addEventListener(eventType, listener);
        }
      }
  }
  else if(type === 'div'){
      div = document.createElement('div') as HTMLDivElement;
      div.innerHTML = icon;
      if(eventType){ // TODO move this down to base properties.  There's a type issue
        div.addEventListener(eventType, listener);
      }
  }
  else
    throw Error(`unknown type while creating toolbar: ${type}`)

  // set base properties
  div.className = `toolbar-item ${name}`;
  div.title = description;
  div.style.width = toolButtonWidth;
  div.style.height = toolButtonHeight;
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  container?.appendChild(div);
  
  return div
}*/

export function createToolbarButton(name: string, description: string, icon: string, type: ToolbarButton, container: HTMLDivElement): HTMLDivElement | HTMLInputElement {
  let div : HTMLInputElement | HTMLDivElement

  switch (type) {
    case 'color':
      div = document.createElement('input') as HTMLInputElement;
      if (div instanceof HTMLInputElement) { // make sure TS knows the type
        div.type = 'color';
        div.style.border = 'none';
      }
      break;
    case 'div':
      div = document.createElement('div') as HTMLDivElement;
      div.innerHTML = icon;
      break;
    default:
      throw Error(`unknown type while creating toolbar: ${type}`)
  }

  // set base properties
  div.className = `toolbar-item ${name}`;
  div.title = description;
  div.style.width = toolButtonWidth;
  div.style.height = toolButtonHeight;
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  container.appendChild(div);
  
  return div
}

export function setSubToolbarButton(subTool: SubTool, subTools: SubTool[], container: HTMLDivElement){
    subTool.addToolButtonToContainer(container); 
    subTool.setSelectedStyling();
    subTool.init()
    subTools.push(subTool);
}

// rgba to hex, then truncates value to fit color input
export function rgbaStringToColorInputHex(rgbaString:string): string | null {
    // Remove spaces
    const cleaned = rgbaString.replace(/\s+/g, '');
  
    // Match rgba or rgb
    const regex = /^rgba?\((\d+),(\d+),(\d+)(?:,([01]?\.?\d+))?\)$/i;
    const match = cleaned.match(regex);
  
    if (!match) {
      console.error("Invalid input:", rgbaString);
      return null;
    }
  
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  
    // Clamp values to avoid errors
    const clamp = (val, max = 255) => Math.min(max, Math.max(0, val));
  
    const toHex = (val) => clamp(val).toString(16).padStart(2, '0');
  
    const rHex = toHex(r); 
    const gHex = toHex(g);
    const bHex = toHex(b);
    const aHex = a < 1 ? toHex(Math.round(clamp(a * 255))) : '';
  
    const hex = `#${rHex}${gHex}${bHex}${aHex}`.toUpperCase();
    return hex.slice(0, 7);
  }

  export function hexToRgba(hex: string, alpha: number = 1): string {
    // Remove the '#' if it exists
    hex = hex.replace(/^#/, '');
  
    // If the HEX color is shorthand (3 digits), expand it to 6 digits
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
  
    // Extract the RGB components from the HEX color
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    // Return the RGBA string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
