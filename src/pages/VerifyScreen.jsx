import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm import này
import Logo from '../assets/icons/Logo.jsx';

const VerifyScreen = ({ onVerify }) => {
    const navigate = useNavigate(); // Khai báo biến navigate
    const [emailSent, setEmailSent] = useState(false);

    // Tự động xác minh và chuyển hướng sau 3s
    useEffect(() => {
        const timer = setTimeout(() => {
            onVerify(); // Cập nhật trạng thái xác minh
            navigate('/dashboard'); // Chuyển hướng ngay lập tức
        }, 3000);

        return () => clearTimeout(timer);
    }, [onVerify, navigate]); // Thêm navigate vào dependencies

    const handleResendEmail = () => {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <div className="max-w-md w-full p-8 bg-gray-900 rounded-lg shadow-lg text-center">
                <div className="rounded-full flex items-center justify-center">
                    <Logo className="w-25 h-25 text-black"/>
                </div>
                <h2 className="text-2xl font-bold mb-6 text-white">Xác thực tài khoản</h2>
                <p className="mb-8 text-gray-300">Hệ thống đang xử lý...</p>
                <div className="mb-8 flex justify-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-gray-700 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-green-500 animate-spin rounded-full"></div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleResendEmail}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full w-full transition duration-300"
                    >
                        Gửi lại email
                    </button>
                    {emailSent && (
                        <div className="mt-4 bg-green-500 bg-opacity-20 text-green-400 p-2 rounded">
                            Đã gửi lại email xác minh!
                        </div>
                    )}
                    <div className="mt-4 text-sm text-gray-400">
                        Không nhận được email? Kiểm tra thư mục spam.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyScreen;