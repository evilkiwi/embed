import vue from '@vitejs/plugin-vue';
import { join, resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    root: __dirname,
    plugins: [
        vue(),
        dts({
            outputDir: join(__dirname, 'build'),
            tsConfigFilePath: join(__dirname, 'tsconfig.json'),
            staticImport: true,
        }),
    ],
    resolve: {
        alias: [
            { find: /^@\/(.*)/, replacement: `${resolve(__dirname, 'src')}/$1` },
        ],
    },
    json: {
        namedExports: false,
        stringify: true,
    },
    build: {
        sourcemap: process.env.MODE === 'development' ? true : false,
        outDir: 'build',
        assetsDir: '.',
        minify: process.env.MODE === 'development' ? false : 'terser',
        target: 'chrome91',
        terserOptions: {
            ecma: 2020,
            compress: {
                passes: 2,
            },
            safari10: false,
        },
        lib: {
            entry: join('src', 'index.ts'),
            fileName: 'index',
            name: 'Embed',
            formats: ['es'],
        },
        rollupOptions: {
            external: ['vue'],
        },
        emptyOutDir: true,
    },
});
