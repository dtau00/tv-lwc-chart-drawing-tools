export class DataStorage {
    /**
     * 
     * @param key key of data for retreival later
     * @param data data  to be saved
     */
    static saveData<T>(key: string, data: T): void {
        const jsonData = JSON.stringify(data, null, 2);
        localStorage.setItem(key, jsonData);
    }

    /**
     * 
     * @param key key of data for retreival later
     * @param defaultValue default value returned if data not found
     * @returns // returns JSON data
     */
    // Load data from JSON (localStorage or file)
    static loadData<T>(key: string, defaultValue: T): T {
        const jsonData = localStorage.getItem(key);
        return jsonData ? JSON.parse(jsonData) : defaultValue;
    }
}

