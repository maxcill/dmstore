import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  nome: string;

  @Column({ length: 120, unique: true })
  slug: string;

  @Column({ length: 255, nullable: true })
  descricao: string;

  @Column({ name: 'icone', length: 50, nullable: true })
  icone: string;

  @OneToMany(() => Product, (product) => product.categoria)
  produtos: Product[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
