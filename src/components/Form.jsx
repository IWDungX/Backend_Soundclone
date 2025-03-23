import { useState } from "react";
import { X } from "lucide-react"; // Import icon X

const Form = ({
                  title,
                  fields, // Mảng các trường (name, label, type)
                  onSubmit, // Xử lý submit
                  onFileUpload, // Xử lý upload file (nếu có)
                  onClose, // Thêm prop onClose
                  initialValues = {}, // Giá trị mặc định
                  isVisible = false, // Thêm prop để kiểm soát hiển thị modal
              }) => {
    const [formData, setFormData] = useState(initialValues);

    // Nếu không visible thì return null
    if (!isVisible) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (onFileUpload && file) {
            onFileUpload(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose(); // Đóng modal sau khi submit
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-black rounded-xl border border-[#282828] shadow-lg w-full max-w-4xl mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#282828]">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.map((field) => (
                            <div key={field.name} className="space-y-2">
                                <label className="block text-gray-300 text-sm font-medium">
                                    {field.label}
                                </label>
                                {field.type === "file" ? (
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-300
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-green-500 file:text-white
                                            hover:file:bg-green-600
                                            cursor-pointer"
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#282828] text-white rounded-lg
                                            border border-gray-600 p-2.5
                                            focus:ring-2 focus:ring-green-500 focus:border-transparent
                                            placeholder-gray-400"
                                        placeholder={`Nhập ${field.label.toLowerCase()}`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer với các nút */}
                    <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-[#282828]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-6 py-2.5 rounded-full
                                hover:bg-gray-600 transition duration-300 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-6 py-2.5 rounded-full
                                hover:bg-green-600 transition duration-300 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Thêm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Form;