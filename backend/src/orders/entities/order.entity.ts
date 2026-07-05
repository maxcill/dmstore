import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_pedido', unique: true, length: 20 })
  numeroPedido: string;

  @ManyToOne(() => User, (user) => user.pedidos, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @OneToMany(() => OrderItem, (item) => item.pedido, { cascade: true, eager: true })
  itens: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'valor_frete', type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorFrete: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDENTE,
  })
  status: OrderStatus;

  @Column({ name: 'endereco_entrega', type: 'jsonb' })
  enderecoEntrega: {
    destinatario: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };

  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
