import { CandlestickData, Time } from "lightweight-charts";

export function generateLineData() {
    const res: any = [];
    const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
    for (let i = 0; i < 500; ++i) {
        res.push({
            time: time.getTime() / 1000,
            value: Math.random() * 100 + 20,
        });
        time.setUTCDate(time.getUTCDate() + 1);
    }
    return res;
} 

export function generateCandlestickData() {
    const res: any = [];
    const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
    
    let basePrice = 100; // Starting price

    for (let i = 0; i < 500; ++i) {
        const open = basePrice + (Math.random() - 0.5) * 10;
        const close = open + (Math.random() - 0.5) * 10;
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;

        res.push({
            time: Math.floor(time.getTime() / 1000), // Convert to timestamp
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
        }) as CandlestickData<Time>;

        time.setUTCDate(time.getUTCDate() + 1);
        basePrice = close; // Use close price as the base for the next day
    }

    return res;
}

