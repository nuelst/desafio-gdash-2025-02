import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UserRole } from '../users/domain/entities/user-role.enum';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
  imports: [UsersModule],
  providers: [],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    const defaultEmail = this.configService.get<string>('defaultUser.email');
    const defaultPassword = this.configService.get<string>(
      'defaultUser.password',
    );

    const existingUser = await this.usersService.findByEmail(defaultEmail);
    if (!existingUser) {
      await this.usersService.create({
        email: defaultEmail,
        password: defaultPassword,
        name: 'Administrador',
        role: UserRole.ADMIN,
      });
      console.log(
        `✅ Usuário padrão criado: ${defaultEmail} / ${defaultPassword} (role: admin)`,
      );
    }
  }
}
