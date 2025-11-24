import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../domain/entities/user-role.enum';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from '../../domain/repositories/user.repository.token';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IUserRepository> = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    repository = module.get(USER_REPOSITORY_TOKEN);
  });

  it('should create a user successfully', async () => {
    const dto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: UserRole.USER,
    };

    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(User);
    expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(repository.create).toHaveBeenCalled();
  });

  it('should throw ConflictException when email already exists', async () => {
    const dto = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
    };

    const existingUser = User.create({
      email: 'existing@example.com',
      password: 'hashedPassword',
      name: 'Existing User',
    });

    repository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should create user with default role when not provided', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'password123',
      name: 'User',
    };

    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(User);
    expect(result.role).toBe(UserRole.USER);
  });
});
