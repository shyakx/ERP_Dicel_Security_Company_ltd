/**
 * Get pagination parameters from request query
 * @param page Page number from query (optional)
 * @param limit Items per page from query (optional)
 * @returns Object with skip and take parameters for Prisma
 */
export const getPaginationParams = (page?: string, limit?: string) => {
  const pageNumber = page ? parseInt(page, 10) : 1;
  const limitNumber = limit ? parseInt(limit, 10) : 10;
  
  return {
    skip: (pageNumber - 1) * limitNumber,
    take: limitNumber,
    pageNumber,
    limitNumber
  };
}; 