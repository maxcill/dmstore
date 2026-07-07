import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoLivreService } from './mercadolivre.service';
import { ImportacaoService } from './importacao.service';
import { ImportacaoController } from './importacao.controller';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Product, Category]),
  ],
  controllers: [ImportacaoController],
  providers: [MercadoLivreService, ImportacaoService],
  exports: [ImportacaoService],
})
export class MercadoLivreModule {}
