export class DataStorage {
    // Save data to JSON (localStorage or file)
    static saveData<T>(key: string, data: T): void {
        const jsonData = JSON.stringify(data, null, 2);
        localStorage.setItem(key, jsonData);
    }

    // Load data from JSON (localStorage or file)
    static loadData<T>(key: string, defaultValue: T): T {
        const jsonData = localStorage.getItem(key);
        return jsonData ? JSON.parse(jsonData) : defaultValue;
    }
}

export class ConfigStorage {
    static saveConfig<T>(key: string, data: T): void {
        const jsonData = JSON.stringify(data, null, 2);
        localStorage.setItem(key, jsonData);
    }

    static loadConfig<T>(key: string, defaultValue: T): T {
        const jsonData = localStorage.getItem(key);
        return jsonData ? JSON.parse(jsonData) : defaultValue;
    }
}

