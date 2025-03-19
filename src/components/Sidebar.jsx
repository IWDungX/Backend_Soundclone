import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Music,
    Disc,
    User,
    Settings,
    Database,
    Clock,
    Tag,
    FileText,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

const Sidebar = ({ isExpanded, toggleExpand }) => {
    const [expandedGroups, setExpandedGroups] = useState({
        common: true,
        listeningData: true
    });

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    const menuItemClass = "flex items-center gap-2 py-2 px-4 text-gray-200 hover:text-indigo-300";
    const groupItemClass = "flex items-center gap-2 py-2 px-4 text-gray-200 hover:text-purple-300 cursor-pointer";

    return (
        <div
            className={`transition-all duration-300 
                ${isExpanded ? 'w-64' : 'w-20'} 
                bg-gray-900 text-white flex flex-col py-6`}
        >
            {/* Nút toggle sidebar */}
            <div className="flex items-center px-4">
                <button
                    className="mr-2 text-gray-400 hover:text-purple-400"
                    onClick={toggleExpand}
                >
                    {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
                {isExpanded && <div className="text-2xl font-bold">Quản Lý</div>}
            </div>

            {/* Nội dung sidebar */}
            <div className="flex-1 overflow-y-auto">

                {/*Trang chủ*/}
                <div className="mt-4">
                    <Link
                        to="/"
                        className={menuItemClass}
                    >
                        <Music className="w-5 h-5" />
                        {isExpanded && <span className="ml-2">Trang chủ</span>}
                    </Link>
                </div>

                {/* Quản lý bài hát*/}
                <div className="mt-4">
                    <Link
                        to="/song-manager"
                        className={menuItemClass}
                    >
                        <Music className="w-5 h-5" />
                        {isExpanded && <span className="ml-2">Quản lý bài hát</span>}
                    </Link>
                </div>

                {/* Quản lý album*/}
                <div className="mt-4">
                    <Link
                        to="/album-manager"
                        className={menuItemClass}
                    >
                        <Disc className="w-5 h-5" />
                        {isExpanded && <span className="ml-2">Quản lý album</span>}
                    </Link>
                </div>

                {/* Quản lý nghệ sĩ*/}
                <div className="mt-4">
                    <Link
                        to="/artist-manager"
                        className={menuItemClass}
                    >
                        <User className="w-5 h-5" />
                        {isExpanded && <span className="ml-2">Quản lý nghệ sĩ</span>}
                    </Link>
                </div>

                {/* Quản lý chung */}
                <div className="mt-4">
                    <div
                        className={groupItemClass}
                        onClick={() => toggleGroup('common')}
                    >
                        <Settings className="w-5 h-5" />
                        {isExpanded && (
                            <span className="ml-2">Quản lý chung</span>
                        )}
                        {isExpanded && (
                            <span
                                className={`ml-auto ${expandedGroups.common ? 'rotate-180' : ''}`}
                            >▼</span>
                        )}
                    </div>
                    {expandedGroups.common && isExpanded && (
                        <div className="pl-8">
                            {/* Xuất báo cáo */}
                            <Link to="/common-manager/reports" className={menuItemClass}>
                                <FileText className="w-5 h-5" />
                                {isExpanded && <span className="ml-2">Xuất báo cáo</span>}
                            </Link>

                            {/* Quản lý dữ liệu lượt nghe */}
                            <div
                                className={groupItemClass}
                                onClick={() => toggleGroup('listeningData')}
                            >
                                <Database className="w-5 h-5" />
                                {isExpanded && (
                                    <span className="ml-2">Dữ liệu lượt nghe</span>
                                )}
                                {isExpanded && (
                                    <span
                                        className={`ml-auto ${expandedGroups.listeningData ? 'rotate-180' : ''}`}
                                    >▼</span>
                                )}
                            </div>
                            {expandedGroups.listeningData && isExpanded && (
                                <div className="pl-8">
                                    <Link to="/common-manager/statistics/time" className={menuItemClass}>
                                        <Clock className="w-5 h-5" />
                                        {isExpanded && (
                                            <span className="ml-2">Thống kê theo thời gian</span>
                                        )}
                                    </Link>
                                    <Link to="/common-manager/statistics/genre" className={menuItemClass}>
                                        <Tag className="w-5 h-5" />
                                        {isExpanded && (
                                            <span className="ml-2">Thống kê theo thể loại</span>
                                        )}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;