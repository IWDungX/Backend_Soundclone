import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchArtists, fetchGenres } from "../services/apiSongs";

const Form = ({
    title,
    fields,
    onSubmit,
    onClose,
    initialValues = {},
    isVisible = false,
}) => {
    const [formData, setFormData] = useState(initialValues);
    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [error, setError] = useState(""); 
    useEffect(() => {
        const loadData = async () => {
            try {
                const artistsData = await fetchArtists();
                const genresData = await fetchGenres();

                setArtists(Array.isArray(artistsData) ? artistsData : []);
                setGenres(Array.isArray(genresData) ? genresData : []);
            } catch (error) {
                console.error("Error loading dropdown data:", error);
                setError("Không thể tải dữ liệu nghệ sĩ hoặc thể loại.");
            }
        };

        if (isVisible) {
            loadData();
            setFormData(initialValues);
            setError(""); 
        }
    }, [isVisible, initialValues]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0]; 
            if (file) {
                setFormData((prev) => {
                    const newData = { ...prev, [name]: file };
                    console.log("Updated formData (file):", newData);
                    return newData;
                });
            }
        } else {
            setFormData((prev) => {
                const newData = { ...prev, [name]: value };
                console.log("Updated formData (text):", newData);
                return newData;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.artist_name && fields.some((f) => f.name === "artist_name")) {
            setError("Vui lòng nhập tên nghệ sĩ.");
            return;
        }

        onSubmit(formData);
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-black rounded-xl border border-[#282828] shadow-lg w-full max-w-4xl mx-4">
                <div className="flex items-center justify-between p-6 border-b border-[#282828]">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Hiển thị lỗi nếu có */}
                    {error && <div className="text-red-500 mb-4">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.map((field) => (
                            <div key={field.name} className="space-y-2">
                                <label className="block text-gray-300 text-sm font-medium">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === "file" ? (
                                    <input
                                        type="file"
                                        name={field.name}
                                        accept={field.name === "file" ? "audio/*" : "image/*"}
                                        onChange={handleInputChange}
                                        className="block w-full text-sm text-gray-300
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-green-500 file:text-white
                                            hover:file:bg-green-600
                                            cursor-pointer"
                                    />
                                ) : field.name === "artist_id" ? (
                                    <select
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={handleInputChange}
                                        required={field.required}
                                        className="w-full bg-[#282828] text-white rounded-lg
                                            border border-gray-600 p-2.5
                                            focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn nghệ sĩ</option>
                                        {artists.map((artist) => (
                                            <option key={artist.artist_id} value={artist.artist_id}>
                                                {artist.artist_name}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.name === "genre_id" ? (
                                    <select
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={handleInputChange}
                                        required={field.required}
                                        className="w-full bg-[#282828] text-white rounded-lg
                                            border border-gray-600 p-2.5
                                            focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn thể loại</option>
                                        {genres.map((genre) => (
                                            <option key={genre.genre_id} value={genre.genre_id}>
                                                {genre.genre_name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={handleInputChange}
                                        required={field.required} // Thêm required nếu cần
                                        className="w-full bg-[#282828] text-white rounded-lg
                                            border border-gray-600 p-2.5
                                            focus:ring-2 focus:ring-green-500 focus:border-transparent
                                            placeholder-gray-400"
                                        placeholder={
                                            field.name === "image_url"
                                                ? "Nhập URL ảnh"
                                                : `Nhập ${field.label.toLowerCase()}`
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>

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
                            {initialValues && Object.keys(initialValues).length > 0 ? "Cập nhật" : "Thêm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Form;