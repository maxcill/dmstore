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
import { Category } from '../../categories/entities/category.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 180 })
  nome: string;

  @Column({ length: 200, unique: true })
  slug: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ length: 100 })
  marca: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({
    name: 'preco_promocional',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precoPromocional: number | null;

  @Column({ default: 0 })
  estoque: number;

  @Column({ type: 'simple-array', nullable: true })
  imagens: string[];

  @Column({ type: 'jsonb', nullable: true })
  especificacoes: Record<string, string>;

  @Column({ default: true })
  ativo: boolean;

  @Column({ name: 'destaque', default: false })
  destaque: boolean;

  @Column({ name: 'avaliacao_media', type: 'decimal', precision: 2, scale: 1, default: 0 })
  avaliacaoMedia: number;

  @ManyToOne(() => Category, (category) => category.produtos, { eager: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Category;

  @OneToMany(() => CartItem, (cartItem) => cartItem.produto)
  itensCarrinho: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.produto)
  itensPedido: OrderItem[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
