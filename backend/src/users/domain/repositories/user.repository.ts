import { BaseRepository } from '../../../shared/domain';
import { User } from '../entities/user.entity';

export type UserFilters = {
  email?: string;
  active?: boolean;
};

export interface IUserRepository extends BaseRepository<User, UserFilters> {
  findByEmail(email: string): Promise<User | null>;
}
