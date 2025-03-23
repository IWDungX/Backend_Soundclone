// components/Table.jsx
const Table = ({ columns, data }) => {
    return (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
            <tr>
                {columns.map((col) => (
                    <th key={col.key} className="px-4 py-2 bg-gray-100">
                        {col.label}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, index) => (
                <tr key={index}>
                    {columns.map((col) => (
                        <td key={col.key} className="border px-4 py-2">
                            {row[col.key]}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default Table;