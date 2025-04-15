import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    server: {
        //open: true,
        port: 5173,
        open: '/src/'
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            'helpers': resolve(__dirname, './helpers'),
            'plugins': resolve(__dirname, './plugins')
        }
    },
}); 
