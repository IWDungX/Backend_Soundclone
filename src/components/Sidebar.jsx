import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Music,
    Users, // Thay Disc bằng Users
    User,
    House,
    Settings,
    Database,
    Clock,
    Tag,
    FileText,
    AlignJustify,
    LogOut
} from "lucide-react";

const Sidebar = ({ isExpanded, toggleExpand, onLogout }) => {
    const location = useLocation();
    const [expandedGroups, setExpandedGroups] = useState({
        common: true,
        listeningData: true
    });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const getLinkClassName = (path) => {
        const baseClass = `flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'} py-3 hover:bg-[#282828] rounded-lg transition duration-200`;
        return `${baseClass} ${isActiveRoute(path) ? 'text-white bg-[#282828]' : 'text-gray-400 hover:text-white'}`;
    };

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    const handleLogout = () => {
        onLogout();
        navigate('/');
        setShowLogoutModal(false);
    };

    const menuItemClass = `flex items-center gap-2 py-2 px-4 text-gray-400 hover:text-white ${!isExpanded ? 'justify-center' : ''}`;
    const groupItemClass = `flex items-center gap-2 py-2 px-4 text-gray-400 hover:text-white cursor-pointer ${!isExpanded ? 'justify-center' : ''}`;
    const activeClass = "text-white bg-[#282828] hover:bg-[#282828]";

    return (
        <>
            <div
                className={`transition-all duration-300 
                ${isExpanded ? 'w-64' : 'w-20'} 
                bg-black text-white flex flex-col
                h-[calc(100vh-2rem)] m-4 rounded-xl // Sửa: Giới hạn chiều cao bằng calc(100vh - 2rem) để trừ margin
                border border-[#282828]`}
            >
                {/* Nút toggle sidebar */}
                <div className="flex items-center justify-center px-4 h-12 mt-2">
                    {isExpanded && (
                        <div className="text-2xl font-bold mr-auto text-white">Quản Lý</div>
                    )}
                    <button
                        className="p-2 hover:bg-[#282828] rounded-lg transition duration-200"
                        onClick={toggleExpand}
                    >
                        <AlignJustify size={20} className="text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Nội dung sidebar */}
                <div className="flex-1 overflow-y-auto px-2">
                    {/* Trang chủ */}
                    <div className="mt-4">
                        <Link
                            to="/dashboard"
                            className={getLinkClassName('/dashboard')}
                        >
                            <House className="w-5 h-5" />
                            {isExpanded && <span className="ml-2">Trang chủ</span>}
                        </Link>
                    </div>

                    {/* Quản lý bài hát */}
                    <div className="mt-4">
                        <Link
                            to="/dashboard/song-manager"
                            className={getLinkClassName('/dashboard/song-manager')}
                        >
                            <Music className="w-5 h-5" />
                            {isExpanded && <span className="ml-2">Quản lý bài hát</span>}
                        </Link>
                    </div>

                    {/* Quản lý người dùng */}
                    <div className="mt-4">
                        <Link
                            to="/dashboard/user-manager"
                            className={getLinkClassName('/dashboard/user-manager')}
                        >
                            <Users className="w-5 h-5" />
                            {isExpanded && <span className="ml-2">Quản lý người dùng</span>}
                        </Link>
                    </div>

                    {/* Quản lý nghệ sĩ */}
                    <div className="mt-4">
                        <Link
                            to="/dashboard/artist-manager"
                            className={getLinkClassName('/dashboard/artist-manager')}
                        >
                            <User className="w-5 h-5" />
                            {isExpanded && <span className="ml-2">Quản lý nghệ sĩ</span>}
                        </Link>
                    </div>

                    {/* Quản lý chung */}
                    <div className="mt-4">
                        <div
                            className={`flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center'} py-3 hover:bg-[#282828] rounded-lg transition duration-200 text-gray-400 hover:text-white cursor-pointer`}
                            onClick={() => toggleGroup('common')}
                        >
                            <Settings className="w-5 h-5" />
                            {isExpanded && (
                                <>
                                    <span className="ml-2">Quản lý chung</span>
                                    <span
                                        className={`ml-2 transition-transform duration-300 ease-in-out ${expandedGroups.common ? 'rotate-180' : 'rotate-0'}`}
                                    >▼</span>
                                </>
                            )}
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedGroups.common ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {isExpanded && (
                                <div className="pl-8">
                                    <Link
                                        to="/dashboard/common-manager/reports"
                                        className={getLinkClassName('/dashboard/common-manager/reports')}
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span className="ml-2">Xuất báo cáo</span>
                                    </Link>

                                    <div
                                        className="flex items-center py-2 px-4 text-gray-400 hover:text-white hover:bg-[#282828] rounded-lg transition duration-200 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleGroup('listeningData');
                                        }}
                                    >
                                        <Database className="w-5 h-5" />
                                        <span className="ml-2">Dữ liệu lượt nghe</span>
                                        <span
                                            className={`ml-2 transition-transform duration-300 ease-in-out ${expandedGroups.listeningData ? 'rotate-180' : 'rotate-0'}`}
                                        >▼</span>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedGroups.listeningData ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pl-8">
                                            <Link
                                                to="/dashboard/common-manager/statistics/time"
                                                className={getLinkClassName('/dashboard/common-manager/statistics/time')}
                                            >
                                                <Clock className="w-5 h-5" />
                                                <span className="ml-2">Theo thời gian</span>
                                            </Link>
                                            <Link
                                                to="/dashboard/common-manager/statistics/genre"
                                                className={getLinkClassName('/dashboard/common-manager/statistics/genre')}
                                            >
                                                <Tag className="w-5 h-5" />
                                                <span className="ml-2">Theo thể loại</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nút đăng xuất */}
                <div className="px-2 mb-4">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`flex items-center w-full ${isExpanded ? 'justify-start px-4' : 'justify-center'} py-3 hover:bg-[#282828] rounded-lg transition duration-200 text-gray-400 hover:text-white`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isExpanded && <span className="ml-2">Đăng xuất</span>}
                    </button>
                </div>
            </div>

            {/* Modal xác nhận đăng xuất */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#282828] p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                        <h2 className="text-white text-xl font-bold mb-4 text-center">Xác nhận đăng xuất</h2>
                        <p className="text-gray-300 mb-6 text-center">Bạn có chắc chắn muốn đăng xuất không?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 rounded-full bg-[#4d4d4d] text-white hover:bg-[#3e3e3e] transition duration-200"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;