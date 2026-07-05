import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrinho_id' })
  carrinho: Cart;

  @ManyToOne(() => Product, (product) => product.itensCarrinho, { eager: true })
  @JoinColumn({ name: 'produto_id' })
  produto: Product;

  @Column({ default: 1 })
  quantidade: number;
}
