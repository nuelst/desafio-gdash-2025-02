import { BaseEntity } from '../entities';

export type FindAllParams<Filters = Record<string, any>> = {
  pagination?: {
    page: number;
    limit: number;
  };
  filters?: Filters;
};

export interface BaseRepository<
  T extends BaseEntity,
  Filters = Record<string, any>,
> {
  create(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(params?: FindAllParams<Filters>): Promise<{
    data: T[];
    total: number;
  }>;
}
