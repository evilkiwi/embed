import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        vue(),
    ],
    server: {
        port: 8000,
        host: '0.0.0.0',
    },
    resolve: {
        alias: [
            { find: /^@\/(.*)/, replacement: `${resolve(__dirname, 'src')}/$1` },
        ],
    },
    build: {
        target: 'chrome91',
        sourcemap: true,
        outDir: 'build',
        assetsDir: '.',
        minify: process.env.MODE === 'development' ? false : 'terser',
        terserOptions: {
            ecma: 2020,
            compress: {
                passes: 2,
            },
            safari10: false,
        },
        rollupOptions: {
            external: ['vue'],
        },
        emptyOutDir: true,
    },
});
