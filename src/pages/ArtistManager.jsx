import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Form from '../components/Form';
import Table from '../components/Table';
import { deleteArtist, fetchArtists, updateArtist, uploadArtist } from '../services/apiArtists';

const ArtistManager = () => {
    const [artists, setArtists] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingArtist, setEditingArtist] = useState(null);
    const [message, setMessage] = useState('');

    // Lấy danh sách nghệ sĩ khi component mount
    useEffect(() => {
        const loadArtists = async () => {
            try {
                const data = await fetchArtists();
                console.log("Dữ liệu API trả về:", data);
                if (Array.isArray(data)) {
                    setArtists(data);
                } else {
                    throw new Error("Dữ liệu từ API không hợp lệ");
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                setMessage("Không thể tải danh sách nghệ sĩ. Vui lòng thử lại.");
            }
        };
        loadArtists();
    }, []);

    // Xử lý thêm nghệ sĩ mới
    const handleSubmit = async (formData) => {
        console.log("Dữ liệu gửi đi:", formData);
        try {
            const response = await uploadArtist(formData);
            const newArtist = response.data; // Đồng bộ với response.data
            setArtists((prevArtists) => [...prevArtists, newArtist]);
            setIsFormVisible(false);
            setMessage("Thêm nghệ sĩ thành công!");
        } catch (error) {
            console.error("Lỗi khi tải lên nghệ sĩ:", error);
            setMessage("Lỗi khi thêm nghệ sĩ. Vui lòng kiểm tra lại.");
        }
    };

    // Xử lý xóa nghệ sĩ
    const handleDelete = async (artist_id) => {
        if (window.confirm("Bạn có chắc muốn xóa nghệ sĩ này?")) {
            try {
                await deleteArtist(artist_id);
                setArtists((prevArtists) => prevArtists.filter((artist) => artist.artist_id !== artist_id));
                setMessage("Xóa nghệ sĩ thành công!");
            } catch (error) {
                console.error("Lỗi khi xóa nghệ sĩ:", error);
                setMessage("Lỗi khi xóa nghệ sĩ. Vui lòng thử lại.");
            }
        }
    };

    // Xử lý cập nhật nghệ sĩ
    const handleEdit = async (artist_id, formData) => {
        try {
            const response = await updateArtist(artist_id, formData);
            const updatedArtist = response.data; // Đồng bộ với response.data
            setArtists((prevArtists) =>
                prevArtists.map((artist) => (artist.artist_id === artist_id ? updatedArtist : artist))
            );
            setIsFormVisible(false);
            setEditingArtist(null);
            setMessage("Cập nhật nghệ sĩ thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật nghệ sĩ:", error);
            setMessage("Lỗi khi cập nhật nghệ sĩ. Vui lòng thử lại.");
        }
    };

    // Cấu hình cột cho bảng
    const columns = [
        { key: "artist_name", label: "Tên nghệ sĩ" },
        { key: "bio", label: "Tiểu sử" },
        {
            key: "image_url",
            label: "Ảnh",
            render: (artist) =>
                artist.image_url ? (
                    <img src={artist.image_url} alt={artist.artist_name} className="w-16 h-16 object-cover" />
                ) : (
                    "Không có ảnh"
                ),
        },
        {
            key: "actions",
            label: "Hành động",
            render: (artist) => (
                <>
                    <button
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        onClick={() => {
                            setEditingArtist(artist);
                            setIsFormVisible(true);
                        }}
                    >
                        Sửa
                    </button>
                    <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(artist.artist_id)}
                    >
                        Xóa
                    </button>
                </>
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <Navbar onAddClick={() => setIsFormVisible(true)} />
            <div className="container mx-auto p-4 flex-1">
                {/* Hiển thị thông báo */}
                {message && (
                    <div
                        className={`p-4 mb-4 rounded ${
                            message.includes("thành công") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}
                <Form
                    isVisible={isFormVisible}
                    onClose={() => {
                        setIsFormVisible(false);
                        setEditingArtist(null);
                        setMessage('');
                    }}
                    title={editingArtist ? "Cập nhật nghệ sĩ" : "Thêm nghệ sĩ"}
                    fields={[
                        { name: "artist_name", label: "Tên nghệ sĩ", type: "text", required: true },
                        { name: "bio", label: "Tiểu sử", type: "text" },
                        { name: "image_url", label: "Ảnh", type: "file" }, // Sửa thành type file để upload ảnh
                    ]}
                    initialValues={{
                        artist_name: editingArtist?.artist_name || "",
                        bio: editingArtist?.bio || "",
                        image_url: "", // Không cần initial image_url cho file input
                    }}
                    onSubmit={(formData) => {
                        if (editingArtist) {
                            handleEdit(editingArtist.artist_id, formData);
                        } else {
                            handleSubmit(formData);
                        }
                    }}
                />
                <div className="mt-8">
                    <Table columns={columns} data={artists} />
                </div>
            </div>
        </div>
    );
};

export default ArtistManager;