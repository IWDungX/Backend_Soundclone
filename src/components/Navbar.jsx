// src/components/Navbar.jsx
import { FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';

function Navbar() {
    return (
        <div className="bg-[#535353] shadow-md p-4 flex items-center justify-between rounded-lg">
            <div className="flex items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#191414] bg-[#707070] text-white border-gray-700"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <FaBell className="text-gray-300 text-xl cursor-pointer" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <FaUserCircle className="text-gray-300 text-2xl" />
                    <span className="font-medium text-white">Admin</span>
                </div>
            </div>
        </div>
    );
}

export default Navbar;