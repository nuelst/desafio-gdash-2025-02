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
    const adminEmail = this.configService.get<string>('admin.email') ||
      this.configService.get<string>('defaultUser.email');
    const adminPassword = this.configService.get<string>('admin.password') ||
      this.configService.get<string>('defaultUser.password');

    const existingUser = await this.usersService.findByEmail(adminEmail);
    if (existingUser) {
      console.log(
        `ℹ️  Admin já existe no banco: ${adminEmail}`,
      );
      return;
    }

    try {
      await this.usersService.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Administrador',
        role: UserRole.ADMIN,
      });
      console.log(
        `✅ Usuário admin criado no banco: ${adminEmail} (role: admin)`,
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log(
        `ℹ️  Admin configurado via variáveis de ambiente: ${adminEmail} (${errorMessage})`,
      );
    }
  }
}
