import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Form from '../components/Form';
import Table from '../components/Table';

const ArtistManager = () => {
    const [artists, setArtists] = useState([
        {
            id: 1,
            name: "Nghệ sĩ A",
            genre: "Pop",
            country: "Việt Nam",
            active: "Đang hoạt động",
        },
    ]);

    const handleSubmit = (formData) => {
        const newId = artists.length + 1;
        const newArtist = { id: newId, ...formData };
        setArtists([...artists, newArtist]);
    };

    const columns = [
        { key: "name", label: "Tên nghệ sĩ" },
        { key: "genre", label: "Thể loại" },
        { key: "country", label: "Quốc gia" },
        { key: "active", label: "Trạng thái" },
    ];

    return (
        <div className="flex flex-col h-full">
            <Navbar />
            <div className="container mx-auto p-4 flex-1">
                <div className="mt-8">
                    <Form
                        title="Thêm nghệ sĩ"
                        fields={[
                            { name: "name", label: "Tên nghệ sĩ", type: "text" },
                            { name: "genre", label: "Thể loại", type: "text" },
                            { name: "country", label: "Quốc gia", type: "text" },
                            { name: "active", label: "Trạng thái", type: "text" },
                        ]}
                        onSubmit={handleSubmit}
                    />
                </div>
                <div className="mt-8">
                    <Table columns={columns} data={artists} />
                </div>
            </div>
        </div>
    );
};

export default ArtistManager;