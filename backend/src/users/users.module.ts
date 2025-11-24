import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from './application/use-cases';
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user.repository.token';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: MongoUserRepository,
    },
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UsersService, USER_REPOSITORY_TOKEN, GetUserByEmailUseCase],
})
export class UsersModule { }
