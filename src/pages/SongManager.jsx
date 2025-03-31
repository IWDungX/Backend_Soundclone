import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Form from "../components/Form";
import Table from "../components/Table";
import { fetchSongs, uploadSong, updateSong, deleteSong } from "../services/api";

const SongManager = () => {
    const [songs, setSongs] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingSong, setEditingSong] = useState(null);

    useEffect(() => {
        fetchSongs()
            .then((data) => setSongs(data))
            .catch((error) => console.error("Error fetching songs:", error));
    }, []);

    const handleSubmit = async (formData) => {
        try {
            const songData = {
                title: formData.title,
                artist_id: formData.artist_id,
                genre_id: formData.genre_id,
                duration: formData.duration || 0,
                file: formData.file,
                image: formData.image,
            };

            let result;
            if (editingSong) {
                result = await updateSong(editingSong.id, songData);
                setSongs(songs.map((s) => (s.id === editingSong.id ? result.song : s)));
            } else {
                result = await uploadSong(songData);
                setSongs([...songs, result.song]);
            }
            setEditingSong(null);
            setIsFormVisible(false);
        } catch (error) {
            alert("Không thể lưu bài hát: " + error.message);
        }
    };

    const handleEdit = (song) => {
        setEditingSong(song);
        setIsFormVisible(true);
    };

    const handleDelete = async (song_id) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài hát này?")) return;
        try {
            await deleteSong(song_id);
            setSongs(songs.filter((song) => song.song_id !== song_id));
        } catch (error) {
            alert("Không thể xóa bài hát: " + error.message);
        }
    };

    const columns = [
        { key: "song_title", label: "Tên bài hát" },
        { key: "genre", label: "Thể loại", render: (value) => value?.genre_name || "N/A" },
        { key: "artist", label: "Nghệ sĩ", render: (value) => value?.artist_name || "N/A" },
        { key: "song_duration", label: "Thời lượng" },
        { key: "song_audio_url", label: "File nhạc", render: (value) => (
            value ? <audio controls src={value} /> : "Chưa có file"
        )},
        {
            key: "actions",
            label: "Hành động",
            render: (_, song) => (
                <>
                    <button onClick={() => handleEdit(song)} className="bg-yellow-500 text-white p-1 rounded mr-2">
                        Sửa
                    </button>
                    <button onClick={() => handleDelete(song.id)} className="bg-red-500 text-white p-1 rounded">
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
                <Form
                    isVisible={isFormVisible}
                    onClose={() => {
                        setEditingSong(null);
                        setIsFormVisible(false);
                    }}
                    title={editingSong ? "Sửa bài hát" : "Thêm bài hát"}
                    fields={[
                        { name: "title", label: "Tên bài hát", type: "text" },
                        { name: "artist_id", label: "Nghệ sĩ", type: "select" },
                        { name: "genre_id", label: "Thể loại", type: "select" },
                        { name: "duration", label: "Thời lượng (giây)", type: "number" },
                        { name: "file", label: "Upload file nhạc", type: "file" },
                        { name: "image", label: "Upload ảnh", type: "file" },
                    ]}
                    onSubmit={handleSubmit}
                    initialValues={
                        editingSong
                            ? {
                                  title: editingSong.song_title,
                                  artist_id: editingSong.artist_id,
                                  genre_id: editingSong.genre_id,
                                  duration: editingSong.song_duration,
                              }
                            : {}
                    }
                />
                <div className="mt-8">
                    <Table columns={columns} data={songs} />
                </div>
            </div>
        </div>
    );
};

export default SongManager;