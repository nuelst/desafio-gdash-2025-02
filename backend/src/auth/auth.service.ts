import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GetUserByEmailUseCase } from '../users/application/use-cases';
import { UserRole } from '../users/domain/entities/user-role.enum';
import { User } from '../users/domain/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const adminEmail = this.configService.get<string>('admin.email');
    const adminPassword = this.configService.get<string>('admin.password');

    if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
      if (password === adminPassword) {
        const adminId = '00000000-0000-0000-0000-000000000001';
        const adminUser = User.rehydrate({
          id: adminId,
          email: adminEmail,
          password: adminPassword,
          name: 'Administrador',
          active: true,
          role: UserRole.ADMIN,
          created_at: new Date(),
          updated_at: new Date(),
        });

        const snapshot = adminUser.toSnapshot();
        delete snapshot.password;
        return snapshot;
      }
      return null;
    }

    const user = await this.getUserByEmailUseCase.execute(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const snapshot = user.toSnapshot();
      delete snapshot.password;
      return snapshot;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
      },
    };
  }
}
