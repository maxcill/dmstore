import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Order;

  @ManyToOne(() => Product, (product) => product.itensPedido, { eager: true })
  @JoinColumn({ name: 'produto_id' })
  produto: Product;

  @Column()
  quantidade: number;

  @Column({ name: 'preco_unitario', type: 'decimal', precision: 10, scale: 2 })
  precoUnitario: number;
}
