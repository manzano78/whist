import type { SortItem } from '~/domain/respositories/pagination/sort-item';

export interface PageRequest {
  page: number;
  size: number;
  sort: SortItem[];
}
