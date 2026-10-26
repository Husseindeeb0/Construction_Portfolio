export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  totalItems: number
  currentPage: number
  totalPages: number
  pageSize: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const DEFAULT_PAGE_SIZE = 10

export const parsePaginationParams = (
  query: Record<string, any>,
  defaultLimit = DEFAULT_PAGE_SIZE
): { skip: number; take: number; page: number; limit: number } => {
  const pageRaw = Number(query.page)
  const limitRaw = Number(query.limit)

  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0 && limitRaw <= 100
      ? limitRaw
      : defaultLimit

  const skip = (page - 1) * limit
  const take = limit

  return { skip, take, page, limit }
}

export const createPaginatedResponse = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(totalItems / limit) || 1
  return {
    data,
    totalItems,
    currentPage: page,
    totalPages,
    pageSize: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
