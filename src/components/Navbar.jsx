import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react"; // Import icon Plus

const Navbar = ({ onAddClick }) => {
    const location = useLocation();

    // Hàm lấy tiêu đề dựa trên đường dẫn hiện tại
    const getTitle = () => {
        const path = location.pathname;
        switch (path) {
            case '/dashboard':
                return 'Trang chủ';
            case '/dashboard/song-manager':
                return 'Quản lý bài hát';
            case '/dashboard/user-manager':
                return 'Quản lý người dùng';
            case '/dashboard/artist-manager':
                return 'Quản lý nghệ sĩ';
            case '/dashboard/common-manager':
                return 'Quản lý chung';
            case '/dashboard/common-manager/reports':
                return 'Báo cáo';
            case '/dashboard/common-manager/statistics/time':
                return 'Thống kê theo thời gian';
            case '/dashboard/common-manager/statistics/genre':
                return 'Thống kê theo thể loại';
            default:
                return 'Quản lý hệ thống';
        }
    };

    return (
        <div className="px-4 mt-4">
            <nav className="bg-black rounded-xl border border-[#282828] shadow-lg">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-white text-2xl font-bold">
                        {getTitle()}
                    </h1>
                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full
                            hover:bg-green-600 transition duration-300 ease-in-out"
                    >
                        <Plus size={20} />
                        <span>Thêm mới</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;