// src/components/Empty.jsx
import React from 'react';

function Empty() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-[#535353] rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-white mb-2">Không có thông tin</h2>
                <p className="text-gray-300">Vui lòng chọn một mục từ sidebar để xem nội dung</p>
            </div>
        </div>
    );
}

export default Empty;