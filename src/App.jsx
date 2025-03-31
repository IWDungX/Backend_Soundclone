import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Empty from './components/Empty';
import ParticleBackground from './components/ParticleBackground';
import SongManager from "./pages/SongManager.jsx";
import UserManager from "./pages/UserManager.jsx";
import ArtistManager from "./pages/ArtistManager.jsx";
import CommonManager from "./pages/CommonManager.jsx";
import ViewManager from "./pages/CommonManager/ViewManager.jsx";
import Login from "./pages/Login.jsx";
import WelcomeScreen from "./pages/WelcomeScreen.jsx";
import VerifyScreen from "./pages/VerifyScreen.jsx";

const Home = () => {
    return (
        <div
            className="flex-1 flex items-center justify-center max-h-full"> {/* Sửa: Thêm max-h-full để giới hạn chiều cao */}
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
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const toggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated');
        const verifyStatus = localStorage.getItem('isVerified');

        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }

        if (verifyStatus === 'true') {
            setIsVerified(true);
        }

        setIsLoading(false);
    }, []);

    const handleLogin = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:15000/api/authAdmin', {
                user_email: email,
                user_password: password
            });
            console.log('Phản hồi từ handleLogin:', response.data);
            if (response.data.success) {
                const { token } = response.data;
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('token', token);
                setIsAuthenticated(true);
                return response.data; // Trả về toàn bộ response.data
            } else {
                return response.data; // Trả về response.data để có errorMessage
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            throw error; // Ném lỗi để Login.jsx xử lý
        }
    };

    
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:15000/api/authAdmin/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}` // Gửi token trong header
                }
            });
            console.log('Phản hồi từ logout:', response.data);

            if (response.data.success) {
                setIsAuthenticated(false);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('token');
            } else {
                console.error('Logout thất bại:', response.data.errorMessage);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API logout:', error.response?.data || error);
            // Vẫn xóa trạng thái cục bộ ngay cả khi API lỗi
            setIsAuthenticated(false);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-2xl">Đang tải...</div>;
    }

    return (
        <Router>
            <div className="fixed inset-0 overflow-hidden bg-black"> {/* Thêm bg-black */}
                <ParticleBackground />
                <div className="relative h-full">
                    <Routes>
                        <Route path="/" element={<WelcomeScreen/>}/>
                        <Route path="/login" element={
                            isAuthenticated ?
                                (isVerified ? <Navigate to="/dashboard"/> : <Navigate to="/dashboard"/>)
                                : <Login onLogin={handleLogin}/>
                        }/>
                        <Route path="/dashboard/*" element={
                            !isAuthenticated ? <Navigate to="/login"/> :
                                    <div className="flex h-full relative z-10">
                                        <Sidebar
                                            isExpanded={isExpanded}
                                            toggleExpand={toggleExpand}
                                            onLogout={handleLogout}
                                        />
                                        <div className="flex-1 overflow-hidden">
                                            <Routes>
                                                <Route path="/" element={<Home/>}/>
                                                <Route path="/song-manager" element={<SongManager/>}/>
                                                <Route path="/user-manager" element={<UserManager/>}/>
                                                <Route path="/artist-manager" element={<ArtistManager/>}/>
                                                <Route path="/common-manager" element={<CommonManager/>}/>
                                                <Route path="/common-manager/reports" element={<ViewManager/>}/>
                                                <Route path="/common-manager/statistics/time" element={<ViewManager/>}/>
                                                <Route path="/common-manager/statistics/genre" element={<ViewManager/>}/>
                                            </Routes>
                                        </div>
                                    </div>
                        }/>
                        <Route path="*" element={
                            isAuthenticated ?
                                (isVerified ? <Navigate to="/dashboard"/> : <Navigate to="/verify-email"/>)
                                : <Navigate to="/login"/>
                        }/>
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;