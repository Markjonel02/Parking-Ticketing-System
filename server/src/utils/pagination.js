// server/src/utils/pagination.js

/**
 * Normalizes page/limit query params and returns both the Mongo
 * skip/limit values to apply to a query and a function to build the
 * response pagination metadata once the total count is known.
 */
export function getPagination(page = 1, limit = 10) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
    buildMeta(totalItems) {
      const totalPages = Math.max(1, Math.ceil(totalItems / parsedLimit));
      return {
        currentPage: parsedPage,
        pageSize: parsedLimit,
        totalItems,
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      };
    },
  };
}

export default getPagination;
