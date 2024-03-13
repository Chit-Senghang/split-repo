export interface PaginationResponse<T> {
  totalCount: number;
  data: T[];
}

// interface/type cannot use typeof or instanceof.
// so we must define our own type guard.
export function isPaginationResponse<T>(
  object: any
): object is PaginationResponse<T> {
  return object && 'totalCount' in object;
}

export interface PageMeta {
  keywords: string;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}

export interface ResponseData {
  id: number | string;
}

export interface Response {
  data?: ResponseData | ResponseData[];
  pageMeta?: PageMeta;
}
