// pages/SongManager.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import Form from "../components/Form";
import Table from "../components/Table";

const SongManager = () => {
    const [songs, setSongs] = useState([
        {
            id: 1,
            title: "Bài hát 1",
            genre: "Pop",
            artist: "Nghệ sĩ A",
            year: 2023,
        },
    ]);

    const handleSubmit = (formData) => {
        const newId = songs.length + 1;
        const newSong = { id: newId, ...formData };
        setSongs([...songs, newSong]);
    };

    const handleFileUpload = (file) => {
        console.log("File uploaded:", file);
    };

    const columns = [
        { key: "title", label: "Tên bài hát" },
        { key: "genre", label: "Thể loại" },
        { key: "artist", label: "Nghệ sĩ" },
        { key: "year", label: "Năm phát hành" },
    ];

    return (
        <div className="flex flex-col h-full">
            <Navbar />
            <div className="container mx-auto p-4 flex-1">
                <div className="mt-8">
                    <Form
                        title="Thêm/Sửa bài hát"
                        fields={[
                            { name: "title", label: "Tên bài hát", type: "text" },
                            { name: "genre", label: "Thể loại", type: "text" },
                            { name: "artist", label: "Nghệ sĩ", type: "text" },
                            { name: "year", label: "Năm phát hành", type: "number" },
                            { name: "file", label: "Upload file nhạc", type: "file" },
                        ]}
                        onSubmit={handleSubmit}
                        onFileUpload={handleFileUpload}
                    />
                </div>
                <div className="mt-8">
                    <Table columns={columns} data={songs} />
                </div>
            </div>
        </div>
    );
};

export default SongManager;
