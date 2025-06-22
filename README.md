# 🎧 Music Streaming App

Ứng dụng nghe nhạc trực tuyến, bao gồm **mobile app (React Native)** và **backend server (Node.js)**. Dự án này cung cấp trải nghiệm stream nhạc, playlist, tìm kiếm, và quản lý tài khoản người dùng.

---

## 📱 Mobile App (React Native)

### ⚙️ Công nghệ sử dụng

* React Native 0.79 (CLI)
* Zustand (quản lý trạng thái)
* React Navigation (navigation, bottom tabs)
* Track Player (streaming nhạc offline/HLS)
* AsyncStorage / EncryptedStorage (lưu local)
* Axios (giao tiếp API)
* Linear Gradient / Toast Message / SVG Icons

### 🔥 Tính năng nổi bật

* Đăng ký / đăng nhập / xác thực JWT
* Danh sách bài hát yêu thích
* Lịch sử phát nhạc
* Phát nhạc online qua HLS (dùng react-native-track-player)
* Quản lý playlist, tìm kiếm, hiển thị gợi ý
* Giao diện hiện đại, responsive

### 🚀 Cài đặt

```bash
git clone https://github.com/IWDungX/Music_Streaming_App.git
cd Music_Streaming_App
cd app
npm install
npx pod-install # Nếu dùng macOS/iOS
```

### ▶️ Chạy app

```bash
npm run android
# hoặc
npm run ios
```

> ⚠️ Yêu cầu đã khởi chạy backend server và thiết bị Android/iOS đang hoạt động với cổng mạng phù hợp.

---

## 🖥️ Backend Server (Node.js + Express)

### 🧱 Công nghệ chính

* Express.js + Sequelize + MySQL
* Redis (OTP + caching)
* MinIO (upload file nhạc + ảnh)
* FFmpeg (convert sang HLS)
* JWT + Bcrypt (xác thực)

### ⚙️ Setup
- The app is dockerized, you can run it on a docker platform with:

```bash
  docker-compose up
```
- Docker will build a network and connect all the services, it offers hot-reload so the code can be edited live.

```bash
cd server
npm install
cp .env.example .env
# Cập nhật các biến môi trường trong .env
npm run dev
```

### 📁 Các endpoint chính

GET /api/:type
→ Lấy toàn bộ danh sách các mục theo loại (songs, artists, albums, playlists, ...)

GET /api/:type/:id
→ Lấy chi tiết một mục cụ thể theo ID

GET /api/liked/:type/user/:id
→ Lấy danh sách các mục đã thích của một người dùng theo loại

GET /api/search?query=...
→ Tìm kiếm bài hát theo từ khóa

GET /api/:type/:id/list
→ Lấy danh sách bài hát trong một album hoặc playlist

POST /api/:type
→ Tạo mục mới (ví dụ: bài hát mới, playlist mới)

POST /api/:type/like
→ Thêm một mục vào danh sách yêu thích của người dùng

PUT /api/:type/:id
→ Cập nhật thông tin của một mục

DELETE /api/:type/:id
→ Xóa một mục khỏi cơ sở dữ liệu

---

## 📂 Cấu trúc dự án

```
Music_Streaming_App/
├── app/             # Mobile App (React Native)
├── server/          # Backend API (Node.js, Express)
└── README.md
```

---

## 📸 Demo
[![Demo Video](https://img.youtube.com/vi/eCGEpmd0lAA/hqdefault.jpg)](https://youtube.com/shorts/eCGEpmd0lAA?feature=share)



