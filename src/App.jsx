import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from './components/Sidebar';
import Empty from './components/Empty';
import SongManager from "./pages/SongManager.jsx";
import AlbumManager from "./pages/AlbumManager.jsx";
import ArtistManager from "./pages/ArtistManager.jsx";
import CommonManager from "./pages/CommonManager.jsx";
import ViewManager from "./pages/CommonManager/ViewManager.jsx";
import Login from "./pages/Login.jsx";
import WelcomeScreen from "./pages/WelcomeScreen.jsx";

const Home = () => {
    return (
        <div className="flex-1 flex items-center justify-center">
            <Empty
                message="Không có dữ liệu"
                description="Hiện tại không có thông tin nào trong hệ thống."
            />
        </div>
    );
};

const App = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động (nếu muốn thoát ứng dụng mà không bị logout khỏi tài khoản thì dùng localStorage)
    useEffect(() => {
        const authStatus = sessionStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const toggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    // Hàm xử lý đăng nhập
    const handleLogin = (username, password) => {
        if (username && password) {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAuthenticated', 'true');
            return true;
        }
        return false;
    };

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
    };

    // Hiển thị loading trong khi kiểm tra trạng thái đăng nhập
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-2xl">Đang tải...</div>;
    }

    return (
        <Router>
            <Routes>
                {/* Trang WelcomeScreen là trang khởi đầu, không bọc trong Sidebar */}
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
                } />

                {/* Các trang khác yêu cầu đăng nhập và được bọc trong Sidebar */}
                <Route path="/dashboard/*" element={
                    isAuthenticated ? (
                        <div className="flex h-screen">
                            <Sidebar
                                isExpanded={isExpanded}
                                toggleExpand={toggleExpand}
                                onLogout={handleLogout}
                            />
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <main className="flex-1 overflow-auto bg-gray-50 p-4">
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/song-manager" element={<SongManager />} />
                                        <Route path="/album-manager" element={<AlbumManager />} />
                                        <Route path="/artist-manager" element={<ArtistManager />} />
                                        <Route path="/common-manager" element={<CommonManager />} />
                                        <Route path="/common-manager/reports" element={<ViewManager />} />
                                        <Route path="/common-manager/statistics/time" element={<ViewManager />} />
                                        <Route path="/common-manager/statistics/genre" element={<ViewManager />} />
                                    </Routes>
                                </main>
                            </div>
                        </div>
                    ) : <Navigate to="/login" />
                } />

                {/* Chuyển hướng các đường dẫn khác khi chưa đăng nhập */}
                <Route path="*" element={
                    isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
                } />
            </Routes>
        </Router>
    );
};

export default App;