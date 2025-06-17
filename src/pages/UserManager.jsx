// UserManager.jsx
import React, { useEffect, useState } from 'react';
import { fetchUsers, updateRole, deleteUser } from '../services/apiUsers';
import Table from '../components/Table';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await fetchUsers();
                console.log('Dữ liệu người dùng:', data); // Log để kiểm tra
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    throw new Error('Dữ liệu từ API không hợp lệ');
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error.message);
                setMessage('Không thể tải danh sách người dùng. Vui lòng thử lại.');
            }
        };
        loadUsers();
    }, []);

    const handleRoleChange = async () => {
        if (!selectedRole) {
            setMessage('Vui lòng chọn một vai trò.');
            return;
        }
        try {
            await updateRole(editingUser.user_id, selectedRole);
            setMessage('Cập nhật role thành công!');
            setEditingUser(null);
            setSelectedRole('');
            // Reload danh sách
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error('Lỗi khi cập nhật role:', error.message);
            setMessage(error.message || 'Cập nhật role thất bại.');
        }
    };

    const handleDelete = async (user_id) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            try {
                await deleteUser(user_id);
                setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== user_id));
                setMessage('Xóa người dùng thành công!');
            } catch (error) {
                console.error('Lỗi khi xóa người dùng:', error.message);
                setMessage(error.message || 'Xóa người dùng thất bại.');
            }
        }
    };

    const columns = [
        { key: 'user_name', label: 'Tên người dùng' },
        { key: 'user_email', label: 'Email' },
        {
            key: 'Roles',
            label: 'Vai trò',
            render: (user) => user.Roles?.map((r) => r.role_name).join(', ') || 'N/A',
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (user) => (
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                            setEditingUser(user);
                            const currentRole = user.Roles?.[0]?.role_name || '';
                            setSelectedRole(currentRole);
                        }}
                    >
                        Sửa role
                    </button>
                    <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(user.user_id)}
                    >
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4 text-white">Quản lý người dùng</h1>

            {message && (
                <div
                    className={`p-4 mb-4 rounded ${
                        message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                >
                    {message}
                </div>
            )}

            <Table columns={columns} data={users} />

            {/* Form sửa role */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#282828] p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                        <h2 className="text-white text-xl font-bold mb-4">
                            Cập nhật role cho {editingUser.user_name}
                        </h2>

                        <select
                            className="w-full p-2 rounded bg-gray-800 text-white mb-4"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">-- Chọn vai trò --</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setEditingUser(null);
                                    setSelectedRole('');
                                    setMessage('');
                                }}
                                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleRoleChange}
                                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;