import type { PageRequest } from '~/domain/respositories/pagination/page-request';

export interface Page<T> extends PageRequest {
  totalElements: number;
  list: T[];
}
