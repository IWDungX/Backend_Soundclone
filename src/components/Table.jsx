import { Pencil, Trash2 } from 'lucide-react';

const Table = ({ columns, data }) => {
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
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-[#282828] transition-colors duration-200">
                            {columns.map((col) => (
                                <td key={col.key} className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                    {col.render ? col.render(row, row) : (row[col.key] ?? "N/A")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
