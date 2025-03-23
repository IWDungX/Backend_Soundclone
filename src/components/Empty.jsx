import React from 'react';
import { FolderOpen, Info, ArrowRight } from 'lucide-react';

function Empty() {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center p-10 bg-black backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-xl text-white">
                <div className="space-y-6 max-w-sm mx-auto">
                    <div className="flex justify-center">
                        <FolderOpen size={64} className="text-gray-400" />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                        <Info size={24} className="text-blue-400" />
                        Không có thông tin
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default Empty;