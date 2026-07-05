import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, User])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
