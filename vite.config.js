import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()], root: './', // Thư mục chứa source code
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:15000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
        },
        port: 3000, // Cổng chạy ứng dụng
        open: true,
        host: true
    }, resolve: {
        alias: {
            '@': '/src', // Định nghĩa alias để dễ dàng import
        },
    },


})
