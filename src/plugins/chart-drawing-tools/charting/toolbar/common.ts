import SubTool from "./sub-tools/sub-tool-base";

export type ToolbarButton = 'div' | 'color'

export function createSubToolbarButton(name: string, description: string, icon: string, type: ToolbarButton, container?: HTMLDivElement): HTMLDivElement | HTMLInputElement {
  return createToolbarButton(name, description, icon, type, () => void 0, '', container);
}

export function createToolbarButton(name: string, description: string, icon: string, type: ToolbarButton, listener: (evt: MouseEvent) => void, eventType: 'click' | 'mousedown' | 'mouseup' | '' = '', container?: HTMLDivElement): HTMLDivElement | HTMLInputElement {

    if(type === 'color'){
        const colorPicker : HTMLInputElement = document.createElement('input');
        colorPicker.className = `toolbar-item ${name}`;
        colorPicker.type = 'color';
        colorPicker.style.border = 'none';
        colorPicker.title = description;
		    container?.appendChild(colorPicker);
        if(eventType !== ''){
          colorPicker.addEventListener(eventType, listener);
        }
        return colorPicker as HTMLInputElement;
    }
    else if(type === 'div'){
        const button : HTMLDivElement = document.createElement('div');
        button.className = `toolbar-item ${name}`;
        button.title = description;
        button.innerHTML = icon;
        if(eventType !== ''){
          button.addEventListener(eventType, listener);
        }
        container?.appendChild(button);
        return button;
    }
    
    // returns empty div
    return document.createElement('div');
}

export function setSubToolbarButton(subTool: SubTool, subTools: SubTool[], container: HTMLDivElement){
    subTool.setToolbarButton(container); 
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
