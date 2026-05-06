import { PaginationParams } from "@/interfaces/pagination-params.interface";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  return {
    cursor: params.cursor ?? '',
    take: Math.min(params.take ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  };
}
