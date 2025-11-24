import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from './application/use-cases';
import { UserRole } from './domain/entities/user-role.enum';
import { User } from './domain/entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let getUsersUseCase: jest.Mocked<GetUsersUseCase>;
  let getUserByIdUseCase: jest.Mocked<GetUserByIdUseCase>;
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
  let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

  beforeEach(async () => {
    const mockCreateUserUseCase = {
      execute: jest.fn(),
    };

    const mockGetUsersUseCase = {
      execute: jest.fn(),
    };

    const mockGetUserByIdUseCase = {
      execute: jest.fn(),
    };

    const mockGetUserByEmailUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateUserUseCase = {
      execute: jest.fn(),
    };

    const mockDeleteUserUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CreateUserUseCase,
          useValue: mockCreateUserUseCase,
        },
        {
          provide: GetUsersUseCase,
          useValue: mockGetUsersUseCase,
        },
        {
          provide: GetUserByIdUseCase,
          useValue: mockGetUserByIdUseCase,
        },
        {
          provide: GetUserByEmailUseCase,
          useValue: mockGetUserByEmailUseCase,
        },
        {
          provide: UpdateUserUseCase,
          useValue: mockUpdateUserUseCase,
        },
        {
          provide: DeleteUserUseCase,
          useValue: mockDeleteUserUseCase,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    createUserUseCase = module.get(CreateUserUseCase);
    getUsersUseCase = module.get(GetUsersUseCase);
    getUserByIdUseCase = module.get(GetUserByIdUseCase);
    updateUserUseCase = module.get(UpdateUserUseCase);
    deleteUserUseCase = module.get(DeleteUserUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.USER,
      };

      const user = User.create(createUserDto);
      createUserUseCase.execute.mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).not.toHaveProperty('password');
      expect(createUserUseCase.execute).toHaveBeenCalled();
      expect(createUserUseCase.execute.mock.calls[0][0].password).not.toBe(
        'password123',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const user1 = User.create({
        email: 'user1@example.com',
        password: 'password',
        name: 'User 1',
        role: UserRole.USER,
      });

      const user2 = User.create({
        email: 'user2@example.com',
        password: 'password',
        name: 'User 2',
        role: UserRole.ADMIN,
      });

      getUsersUseCase.execute.mockResolvedValue([user1, user2]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
        role: UserRole.USER,
      });

      getUserByIdUseCase.execute.mockResolvedValue(user);

      const result = await service.findOne('user-id');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(getUserByIdUseCase.execute).toHaveBeenCalledWith('user-id');
    });
  });

  describe('update', () => {
    it('should update user and hash password if provided', async () => {
      const user = User.create({
        email: 'test@example.com',
        password: 'oldpassword',
        name: 'Test User',
        role: UserRole.USER,
      });

      const updateDto = {
        name: 'Updated Name',
        password: 'newpassword123',
      };

      updateUserUseCase.execute.mockResolvedValue(user);

      await service.update('user-id', updateDto);

      expect(updateUserUseCase.execute).toHaveBeenCalled();
      expect(updateUserUseCase.execute.mock.calls[0][1].password).not.toBe(
        'newpassword123',
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      deleteUserUseCase.execute.mockResolvedValue(undefined);

      await service.remove('user-id');

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith('user-id');
    });
  });
});
