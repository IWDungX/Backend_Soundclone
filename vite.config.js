import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()], root: './', // Thư mục chứa source code
    server: {
        port: 3001, // Cổng chạy ứng dụng
        open: true,  // Tự động mở trình duyệt khi chạy
    }, resolve: {
        alias: {
            '@': '/src', // Định nghĩa alias để dễ dàng import
        },
    },


})
