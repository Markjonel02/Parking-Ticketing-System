// server/src/utils/pagination.js
export function paginate(items, page = 1, limit = 10) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / parsedLimit) || 1;
  const offset = (parsedPage - 1) * parsedLimit;
  const paginatedData = items.slice(offset, offset + parsedLimit);

  return {
    data: paginatedData,
    pagination: {
      currentPage: parsedPage,
      pageSize: parsedLimit,
      totalItems,
      totalPages,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
}
