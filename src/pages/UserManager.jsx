import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Form from '../components/Form';
import Table from '../components/Table';

const UserManager = () => {
    //Data giả
    const [users, setUsers] = useState([
        {
            id: 1,
            username: "user1",
            email: "user1@example.com",
            role: "User",
            status: "Active",
        },
    ]);

    // Thêm state để kiểm soát form
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleSubmit = (formData) => {
        const newId = users.length + 1;
        const newUser = { id: newId, ...formData };
        setUsers([...users, newUser]);
        setIsFormVisible(false); // Đóng form sau khi submit
    };

    const columns = [
        { key: "username", label: "Tên người dùng" },
        { key: "email", label: "Email" },
        { key: "role", label: "Vai trò" },
        { key: "status", label: "Trạng thái" },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Truyền prop onAddClick vào Navbar */}
            <Navbar onAddClick={() => setIsFormVisible(true)} />
            <div className="container mx-auto p-4 flex-1">
                {/* Hiển thị form nếu isFormVisible = true */}
                <Form
                    isVisible={isFormVisible}
                    onClose={() => setIsFormVisible(false)}
                    title="Thêm người dùng"
                    fields={[
                        { name: "username", label: "Tên người dùng", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "role", label: "Vai trò", type: "text" },
                        { name: "status", label: "Trạng thái", type: "text" },
                    ]}
                    onSubmit={handleSubmit}
                />
                <div className="mt-8">
                    <Table columns={columns} data={users} />
                </div>
            </div>
        </div>
    );
};

export default UserManager;