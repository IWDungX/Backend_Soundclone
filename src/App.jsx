import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
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
        const authStatus = sessionStorage.getItem('isAuthenticated');
        const verifyStatus = sessionStorage.getItem('isVerified');

        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }

        if (verifyStatus === 'true') {
            setIsVerified(true);
        }

        setIsLoading(false);
    }, []);

    const handleLogin = (username, password) => {
        if (username && password) {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAuthenticated', 'true');
            return true;
        }
        return false;
    };

    const handleVerify = () => {
        setIsVerified(true);
        sessionStorage.setItem('isVerified', 'true');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setIsVerified(false);
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('isVerified');
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
                                (isVerified ? <Navigate to="/dashboard"/> : <Navigate to="/verify-email"/>)
                                : <Login onLogin={handleLogin}/>
                        }/>
                        <Route path="/verify-email" element={
                            !isAuthenticated ? <Navigate to="/login"/> :
                                (isVerified ? <Navigate to="/dashboard"/> : <VerifyScreen onVerify={handleVerify}/>)
                        }/>
                        <Route path="/dashboard/*" element={
                            !isAuthenticated ? <Navigate to="/login"/> :
                                (!isVerified ? <Navigate to="/verify-email"/> :
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
                                )
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