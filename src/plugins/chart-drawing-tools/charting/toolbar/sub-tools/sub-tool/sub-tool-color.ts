import SubTool from "../sub-tool-base";
import { DrawingSubToolType } from "../drawing-sub-tools";

// Temporary class to get sequential colors
// TODO: replace with color picker
class SequentialColorPicker {
    // Predefined colors in sequential order across the RGB scale
    private predefinedColors: string[] = [
        "rgba(191, 0, 0, 0.75)", "rgba(191, 48, 0, 0.75)", "rgba(191, 96, 0, 0.75)", "rgba(191, 143, 0, 0.75)", "rgba(191, 191, 0, 0.75)",
        "rgba(143, 191, 0, 0.75)", "rgba(96, 191, 0, 0.75)", "rgba(48, 191, 0, 0.75)", "rgba(0, 191, 0, 0.75)", "rgba(0, 191, 48, 0.75)",
        "rgba(0, 191, 96, 0.75)", "rgba(0, 191, 143, 0.75)", "rgba(0, 191, 191, 0.75)", "rgba(0, 143, 191, 0.75)", "rgba(0, 96, 191, 0.75)",
        "rgba(0, 48, 191, 0.75)", "rgba(0, 0, 191, 0.75)", "rgba(48, 0, 191, 0.75)", "rgba(96, 0, 191, 0.75)", "rgba(143, 0, 191, 0.75)",
        "rgba(191, 0, 191, 0.75)", "rgba(191, 0, 143, 0.75)", "rgba(191, 0, 96, 0.75)", "rgba(191, 0, 48, 0.75)", "rgba(191, 0, 0, 0.75)",
        "rgba(191, 48, 0, 0.75)",

        // 5 Shades of Gray
        "rgba(51, 51, 51, 0.75)",  // Dark Gray
        "rgba(102, 102, 102, 0.75)", // Medium Dark Gray
        "rgba(153, 153, 153, 0.75)", // Medium Gray
        "rgba(204, 204, 204, 0.75)", // Light Gray
        "rgba(230, 230, 230, 0.75)"  // Very Light Gray
    ];

    // Function to get the next color after the provided color
    public getNextColor(currentColor?: string): string {
        // If no color is provided or it's not in the list, return the first color
        if (!currentColor || !this.predefinedColors.includes(currentColor)) {
            return this.predefinedColors[0];  // First color
        }

        // Find the index of the current color in the predefined colors list
        const currentIndex = this.predefinedColors.indexOf(currentColor);

        // Return the next color in the list, or loop back to the first if it's the last color
        const nextIndex = (currentIndex + 1) % this.predefinedColors.length;
        return this.predefinedColors[nextIndex];
    }
}

export class SubToolColor extends SubTool {
    private _sequentialColorPicker: SequentialColorPicker = new SequentialColorPicker();

    constructor(propertyName: string, parentTool: string, name: string, description: string, icon: string, index: number, valueUpdatedCallback?: (value: any) => void) {
        super(propertyName, parentTool, name, description, icon, index, DrawingSubToolType.Color, valueUpdatedCallback);
    }

    mouseListener(evt: MouseEvent, index?: number): void {
        // if rclick, open color picker
        if (evt.button === 2) { // rclick, TODO open color picker
            const color = this._sequentialColorPicker.getNextColor(this.value);
            this.setValue(color);
            this.setSelectedTool(index);
            // open color picker
            //const colorPicker = new ColorPicker();
            //colorPicker.show();
        }
        if (evt.button === 0) {
            this.setSelectedTool(index);
        }
    }

    updateDiv(): void {
        if (!this.div) return
        this.div.style.borderRadius = '50%';
        this.div.style.width = '20px';
        this.div.style.height = '20px';
        this.div.style.border = '1px solid #000';
        this.div.style.backgroundColor = this.value;
    }
}