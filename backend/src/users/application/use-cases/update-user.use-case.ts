import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Email } from '../../../shared/domain';
import { UserRole } from '../../domain/entities/user-role.enum';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user.repository.token';

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  active?: boolean;
  role?: UserRole;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.email && dto.email !== user.email.value) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    if (dto.name) {
      (user as any)._name = dto.name;
    }
    if (dto.email) {
      (user as any)._email = new Email(dto.email);
    }
    if (dto.password) {
      user.changePassword(dto.password);
    }
    if (dto.active !== undefined) {
      if (dto.active) {
        user.activate();
      } else {
        user.deactivate();
      }
    }
    if (dto.role !== undefined) {
      user.changeRole(dto.role);
    }

    await this.userRepository.update(user);
    return user;
  }
}
