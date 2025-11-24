import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from './application/use-cases';
import { UserSnapshot } from './domain/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserResponse = Omit<UserSnapshot, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.createUserUseCase.execute({
      ...createUserDto,
      password: hashedPassword,
    });
    const snapshot = user.toSnapshot();
    delete snapshot.password;
    return snapshot;
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.getUsersUseCase.execute();
    return users.map((user) => {
      const snapshot = user.toSnapshot();
      delete snapshot.password;
      return snapshot;
    });
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.getUserByIdUseCase.execute(id);
    const snapshot = user.toSnapshot();
    delete snapshot.password;
    return snapshot;
  }

  async findByEmail(email: string): Promise<UserSnapshot | null> {
    const user = await this.getUserByEmailUseCase.execute(email);
    if (!user) return null;
    return user.toSnapshot();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
    const snapshot = user.toSnapshot();
    delete snapshot.password;
    return snapshot;
  }

  async remove(id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }
}
