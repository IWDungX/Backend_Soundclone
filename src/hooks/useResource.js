import { useState } from 'react';

export const useResource = (initialData = []) => {
    const [items, setItems] = useState(initialData); // Mock data
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Số mục trên 1 trang

    // Hàm thêm mục mới
    const createItem = (newItem) => {
        setItems([...items, newItem]);
    };

    // Phân trang
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    return {
        items,
        currentItems,
        totalPages,
        currentPage,
        setCurrentPage,
        createItem,
    };
};