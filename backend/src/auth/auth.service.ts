import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const usuario = await this.usersService.create(registerDto);
    return this.gerarResposta(usuario);
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.usersService.findByEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Esta conta está desativada');
    }

    return this.gerarResposta(usuario);
  }

  private gerarResposta(usuario: User) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    };
  }
}
