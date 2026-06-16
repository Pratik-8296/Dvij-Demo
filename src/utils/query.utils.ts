import { Op, Order } from 'sequelize';

export interface ParsedQuery {
  limit: number;
  offset: number;
  order: Order;
}

/**
 * Parses page and limit parameters, returning calculated limit and offset.
 */
export const getPagination = (page: number = 1, limit: number = 10): { limit: number; offset: number } => {
  const parsedLimit = Math.max(1, limit);
  const parsedPage = Math.max(1, page);
  const offset = (parsedPage - 1) * parsedLimit;
  return { limit: parsedLimit, offset };
};

/**
 * Formats response data with pagination metadata.
 */
export const getPagingData = <T>(
  data: { count: number; rows: T[] },
  page: number = 1,
  limit: number = 10
) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = Math.max(1, page);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    items,
    totalPages,
    currentPage,
    limit,
  };
};

/**
 * Builds standard sort options for Sequelize.
 */
export const getSorting = (
  sortBy: string = 'createdAt',
  sortOrder: string = 'DESC',
  allowedFields: string[] = []
): Order => {
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt';
  return [[field, order]];
};
