import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Form from '../components/Form';
import Table from '../components/Table';

const UserManager = () => {
    const [users, setUsers] = useState([
        {
            id: 1,
            username: "user1",
            email: "user1@example.com",
            role: "User",
            status: "Active",
        },
    ]);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (formData) => {
        if (isEditing) {
            // Cập nhật user
            setUsers(users.map(user => 
                user.id === selectedUser.id ? { ...user, ...formData } : user
            ));
        } else {
            // Thêm user mới
            const newId = users.length + 1;
            const newUser = { id: newId, ...formData };
            setUsers([...users, newUser]);
        }
        setIsFormVisible(false);
        setSelectedUser(null);
        setIsEditing(false);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = () => {
        setUsers(users.filter(user => user.id !== selectedUser.id));
        setIsDeleteModalVisible(false);
        setSelectedUser(null);
    };

    const columns = [
        { key: "username", label: "Tên người dùng" },
        { key: "email", label: "Email" },
        { key: "role", label: "Vai trò" },
        { key: "status", label: "Trạng thái" },
    ];

    return (
        <div className="flex flex-col h-full">
            <Navbar onAddClick={() => {
                setIsEditing(false);
                setSelectedUser(null);
                setIsFormVisible(true);
            }} />
            
            <div className="container mx-auto p-4 flex-1">
                {/* Form thêm/sửa */}
                <Form
                    isVisible={isFormVisible}
                    onClose={() => {
                        setIsFormVisible(false);
                        setSelectedUser(null);
                        setIsEditing(false);
                    }}
                    title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                    fields={[
                        { name: "username", label: "Tên người dùng", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "role", label: "Vai trò", type: "text" },
                        { name: "status", label: "Trạng thái", type: "text" },
                    ]}
                    initialValues={selectedUser || {}}
                    onSubmit={handleSubmit}
                />

                {/* Modal xác nhận xóa */}
                {isDeleteModalVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-[#282828] p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                            <h2 className="text-white text-xl font-bold mb-4">Xác nhận xóa</h2>
                            <p className="text-gray-300 mb-6">
                                Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.username}" không?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsDeleteModalVisible(false)}
                                    className="px-4 py-2 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <Table 
                        columns={columns} 
                        data={users}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserManager;