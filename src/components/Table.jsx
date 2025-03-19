// src/components/Table.jsx
import { useState } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function Table({ activeTab }) {
    // Mock data cho bảng
    const [data, setData] = useState({
        info: [
            { id: 1, name: 'Thông tin 1', description: 'Mô tả thông tin 1', status: 'Hoạt động', date: '15/03/2025' },
            { id: 2, name: 'Thông tin 2', description: 'Mô tả thông tin 2', status: 'Chờ xử lý', date: '16/03/2025' },
            { id: 3, name: 'Thông tin 3', description: 'Mô tả thông tin 3', status: 'Hoạt động', date: '17/03/2025' },
            { id: 4, name: 'Thông tin 4', description: 'Mô tả thông tin 4', status: 'Hoạt động', date: '18/03/2025' },
            { id: 5, name: 'Thông tin 5', description: 'Mô tả thông tin 5', status: 'Chờ xử lý', date: '19/03/2025' },
            { id: 6, name: 'Thông tin 6', description: 'Mô tả thông tin 6', status: 'Hoạt động', date: '20/03/2025' },
            { id: 7, name: 'Thông tin 7', description: 'Mô tả thông tin 7', status: 'Hoạt động', date: '21/03/2025' },
            { id: 8, name: 'Thông tin 8', description: 'Mô tả thông tin 8', status: 'Chờ xử lý', date: '22/03/2025' },
        ],
        artists: [
            { id: 1, name: 'Nghệ sĩ A', genre: 'Pop', followers: '10,000', songs: 35 },
            { id: 2, name: 'Nghệ sĩ B', genre: 'Rock', followers: '8,500', songs: 28 },
            { id: 3, name: 'Nghệ sĩ C', genre: 'Jazz', followers: '6,200', songs: 42 },
            { id: 4, name: 'Nghệ sĩ D', genre: 'Pop', followers: '12,000', songs: 25 },
            { id: 5, name: 'Nghệ sĩ E', genre: 'Rock', followers: '9,800', songs: 30 },
            { id: 6, name: 'Nghệ sĩ F', genre: 'Jazz', followers: '7,500', songs: 38 },
            { id: 7, name: 'Nghệ sĩ G', genre: 'Hip Hop', followers: '15,000', songs: 20 },
            { id: 8, name: 'Nghệ sĩ H', genre: 'Pop', followers: '11,200', songs: 22 },
        ],
        users: [
            { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', status: 'Hoạt động' },
            { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0912345678', status: 'Không hoạt động' },
            { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0923456789', status: 'Hoạt động' },
            { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0934567890', status: 'Hoạt động' },
            { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '0945678901', status: 'Không hoạt động' },
            { id: 6, name: 'Đặng Thị F', email: 'dangthif@example.com', phone: '0956789012', status: 'Hoạt động' },
            { id: 7, name: 'Ngô Văn G', email: 'ngovang@example.com', phone: '0967890123', status: 'Hoạt động' },
            { id: 8, name: 'Vũ Thị H', email: 'vuthih@example.com', phone: '0978901234', status: 'Không hoạt động' },
        ],
    });

    // Hàm xóa dữ liệu
    const handleDelete = (id) => {
        setData({
            ...data,
            [activeTab]: data[activeTab].filter(item => item.id !== id),
        });
    };

    // Render bảng khác nhau tùy theo tab
    const renderTable = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <table className="min-w-full bg-[#535353] text-white">
                        <thead>
                        <tr className="bg-[#707070]">
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Tên thông tin</th>
                            <th className="py-3 px-4 text-left">Mô tả</th>
                            <th className="py-3 px-4 text-left">Trạng thái</th>
                            <th className="py-3 px-4 text-left">Ngày tạo</th>
                            <th className="py-3 px-4 text-left">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.info.map((item) => (
                            <tr key={item.id} className="border-b border-gray-700">
                                <td className="py-3 px-4">{item.id}</td>
                                <td className="py-3 px-4">{item.name}</td>
                                <td className="py-3 px-4">{item.description}</td>
                                <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${item.status === 'Hoạt động' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'}`}>
                      {item.status}
                    </span>
                                </td>
                                <td className="py-3 px-4">{item.date}</td>
                                <td className="py-3 px-4 flex gap-2">
                                    <button className="text-blue-400 hover:text-blue-300">
                                        <FaEye />
                                    </button>
                                    <button className="text-green-400 hover:text-green-300">
                                        <FaEdit />
                                    </button>
                                    <button className="text-red-400 hover:text-red-300" onClick={() => handleDelete(item.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );
            case 'artists':
                return (
                    <table className="min-w-full bg-[#535353] text-white">
                        <thead>
                        <tr className="bg-[#707070]">
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Tên nghệ sĩ</th>
                            <th className="py-3 px-4 text-left">Thể loại</th>
                            <th className="py-3 px-4 text-left">Người theo dõi</th>
                            <th className="py-3 px-4 text-left">Số bài hát</th>
                            <th className="py-3 px-4 text-left">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.artists.map((item) => (
                            <tr key={item.id} className="border-b border-gray-700">
                                <td className="py-3 px-4">{item.id}</td>
                                <td className="py-3 px-4">{item.name}</td>
                                <td className="py-3 px-4">{item.genre}</td>
                                <td className="py-3 px-4">{item.followers}</td>
                                <td className="py-3 px-4">{item.songs}</td>
                                <td className="py-3 px-4 flex gap-2">
                                    <button className="text-blue-400 hover:text-blue-300">
                                        <FaEye />
                                    </button>
                                    <button className="text-green-400 hover:text-green-300">
                                        <FaEdit />
                                    </button>
                                    <button className="text-red-400 hover:text-red-300" onClick={() => handleDelete(item.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );
            case 'users':
                return (
                    <table className="min-w-full bg-[#535353] text-white">
                        <thead>
                        <tr className="bg-[#707070]">
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Tên người dùng</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Số điện thoại</th>
                            <th className="py-3 px-4 text-left">Trạng thái</th>
                            <th className="py-3 px-4 text-left">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.users.map((item) => (
                            <tr key={item.id} className="border-b border-gray-700">
                                <td className="py-3 px-4">{item.id}</td>
                                <td className="py-3 px-4">{item.name}</td>
                                <td className="py-3 px-4">{item.email}</td>
                                <td className="py-3 px-4">{item.phone}</td>
                                <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${item.status === 'Hoạt động' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                      {item.status}
                    </span>
                                </td>
                                <td className="py-3 px-4 flex gap-2">
                                    <button className="text-blue-400 hover:text-blue-300">
                                        <FaEye />
                                    </button>
                                    <button className="text-green-400 hover:text-green-300">
                                        <FaEdit />
                                    </button>
                                    <button className="text-red-400 hover:text-red-300" onClick={() => handleDelete(item.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-[#535353] p-4 rounded-lg shadow-md overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Danh sách</h2>
                <div className="flex items-center gap-2">
                    <select className="border p-2 rounded bg-[#707070] text-white border-gray-600">
                        <option value="10">10 hàng</option>
                        <option value="20">20 hàng</option>
                        <option value="50">50 hàng</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="border p-2 rounded bg-[#707070] text-white border-gray-600"
                    />
                </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {renderTable()}
            </div>
            <div className="mt-4 flex justify-between items-center text-white">
                <div>Hiển thị 1-{data[activeTab].length} của {data[activeTab].length} kết quả</div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded bg-[#707070] border-gray-600">Trước</button>
                    <button className="px-3 py-1 border rounded bg-[#191414] text-white border-gray-600">1</button>
                    <button className="px-3 py-1 border rounded bg-[#707070] border-gray-600">Tiếp</button>
                </div>
            </div>
        </div>
    );
}

export default Table;