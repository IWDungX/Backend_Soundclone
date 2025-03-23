// components/Table.jsx
import { Pencil, Trash2 } from 'lucide-react';

const Table = ({ 
    columns, 
    data,
    onEdit,
    onDelete 
}) => {
    return (
        <div className="bg-black rounded-xl border border-[#282828] shadow-lg overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-[#282828]">
                        {columns.map((col) => (
                            <th key={col.key} className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                    {data.map((row, index) => (
                        <tr 
                            key={index}
                            className="hover:bg-[#282828] transition-colors duration-200"
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                    {row[col.key]}
                                </td>
                            ))}
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => onEdit(row)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(row)}
                                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;