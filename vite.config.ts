import { defineConfig } from 'vitest/config'
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    server: {
        //open: true,
        port: 5173,
        open: '/src/'
    },
    test: {
        globals: true,
        environment: 'jsdom', // or 'node' depending on your needs
        //setupFiles: './test/setup.ts', // optional
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            'helpers': resolve(__dirname, './helpers'),
            'plugins': resolve(__dirname, './plugins')
        }
    },

}); 
