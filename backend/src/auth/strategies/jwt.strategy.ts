import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const adminId = '00000000-0000-0000-0000-000000000001';
    if (payload.sub === adminId) {
      const adminEmail = this.configService.get<string>('admin.email');
      return {
        userId: adminId,
        email: adminEmail,
        role: 'admin',
        name: 'Administrador',
        active: true
      };
    }

    // Para usuários normais, busca no banco
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: user.role,
      name: user.name,
      active: user.active
    };
  }
}
