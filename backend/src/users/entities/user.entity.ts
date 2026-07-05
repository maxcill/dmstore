import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  nome: string;

  @Column({ unique: true, length: 180 })
  email: string;

  @Column()
  @Exclude()
  senha: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENTE,
  })
  role: UserRole;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => Order, (order) => order.usuario)
  pedidos: Order[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
