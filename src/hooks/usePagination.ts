import { useState } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    // clamp page if items shrink
    const safePage = Math.min(currentPage, totalPages);
    const paginated = items.slice((safePage - 1) * pageSize, safePage * pageSize);

    const goTo    = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    const goNext  = () => goTo(safePage + 1);
    const goPrev  = () => goTo(safePage - 1);

    return {
        paginated,
        currentPage: safePage,
        totalPages,
        totalItems: items.length,
        pageSize,
        goTo,
        goNext,
        goPrev,
        hasPrev: safePage > 1,
        hasNext: safePage < totalPages,
    };
}
