import React from 'react';

function Empty() {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center p-10 bg-black backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-xl text-white">
                <div className="space-y-4 max-w-sm mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Không có thông tin
                    </h2>
                    <p className="text-lg">
                        Vui lòng chọn một mục từ sidebar để xem nội dung
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Empty;