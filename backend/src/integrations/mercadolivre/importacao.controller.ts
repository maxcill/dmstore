import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MercadoLivreService } from './mercadolivre.service';
import { ImportacaoService } from './importacao.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

class ImportarSelecionadosDto {
  @IsArray()
  mlIds: string[];

  @IsString()
  categoriaId: string;
}

class ImportarCategoriaDto {
  @IsString()
  categoriaMLSlug: string;

  @IsString()
  categoriaId: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limite?: number;
}

class ImportarTudoDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limite?: number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/importacao')
export class ImportacaoController {
  constructor(
    private readonly mlService: MercadoLivreService,
    private readonly importacaoService: ImportacaoService,
  ) {}

  @Get('buscar')
  buscar(
    @Query('q') query: string,
    @Query('limite') limite?: number,
    @Query('offset') offset?: number,
  ) {
    return this.mlService.buscarProdutos(query, limite ?? 20, offset ?? 0);
  }

  @Get('buscar-categoria')
  buscarCategoria(
    @Query('slug') slug: string,
    @Query('limite') limite?: number,
  ) {
    const categoriaId = this.mlService.categoriasML[slug];
    if (!categoriaId) {
      return {
        erro: 'Categoria ML não encontrada',
        categoriasDisponiveis: Object.keys(this.mlService.categoriasML),
      };
    }
    return this.mlService.buscarPorCategoria(categoriaId, limite ?? 20);
  }

  @Post('importar-selecionados')
  importarSelecionados(@Body() dto: ImportarSelecionadosDto) {
    return this.importacaoService.importarSelecionados(dto.mlIds, dto.categoriaId);
  }

  @Post('importar-categoria')
  importarCategoria(@Body() dto: ImportarCategoriaDto) {
    return this.importacaoService.importarPorCategoria(
      dto.categoriaMLSlug as any,
      dto.categoriaId,
      dto.limite ?? 10,
    );
  }

  @Post('importar-tudo')
  importarTudo(@Body() dto: ImportarTudoDto) {
    return this.importacaoService.importarTodasCategorias(dto.limite ?? 5);
  }

  @Get('categorias-ml')
  categoriasML() {
    return this.mlService.categoriasML;
  }
}
