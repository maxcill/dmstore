import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existente = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existente) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    const senhaCriptografada = await bcrypt.hash(registerDto.senha, 10);

    const usuario = this.usersRepository.create({
      ...registerDto,
      senha: senhaCriptografada,
    });

    return this.usersRepository.save(usuario);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const usuario = await this.usersRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { criadoEm: 'DESC' } });
  }
}
