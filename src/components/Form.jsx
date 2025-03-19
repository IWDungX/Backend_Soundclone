// src/components/Form.jsx
import { useState } from 'react';

function Form({ activeTab }) {
    // State cho các trường dữ liệu
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'active',
    });

    // Cập nhật state khi người dùng nhập liệu
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Xử lý submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Thêm logic xử lý form tại đây
    };

    // Render form khác nhau tùy theo tab
    const renderForm = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-300">Tên thông tin</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-[#707070] text-white border-gray-600"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-300">Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-[#707070] text-white border-gray-600"
                                rows="3"
                            ></textarea>
                        </div>
                    </>
                );
            case 'artists':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-300">Tên nghệ sĩ</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-[#707070] text-white border-gray-600"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-300">Thể loại</label>
                            <select
                                name="genre"
                                value={formData.genre}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-[#707070] text-white border-gray-600"
                            >
                                <option value="">Chọn thể loại</option>
                                <option value="pop">Pop</option>
                                <option value="rock">Rock</option>
                                <option value="jazz">Jazz</option>
                                <option value="hiphop">Hip Hop</option>
                            </select>
                        </div>
                    </>
                );
            case 'users':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-300">Tên người dùng</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-[#707070] text-white border-gray-600"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-[#707070] text-white border-gray-600"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-300">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-[#707070] text-white border-gray-600"
                            />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-[#535353] p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Thêm mới</h2>
            <form onSubmit={handleSubmit}>
                {renderForm()}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="bg-[#191414] text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        Lưu
                    </button>
                    <button
                        type="button"
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        onClick={() => setFormData({ name: '', email: '', phone: '', status: 'active' })}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Form;