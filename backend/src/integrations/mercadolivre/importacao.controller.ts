import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MercadoLivreService } from './mercadolivre.service';
import { ImportacaoService } from './importacao.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

class ImportarSelecionadosDto {
  mlIds: string[];
  categoriaId: string;
}

class ImportarCategoriaDto {
  categoriaMLSlug: string;
  categoriaId: string;
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

  // Buscar produtos no ML para prévia antes de importar
  @Get('buscar')
  buscar(
    @Query('q') query: string,
    @Query('limite') limite?: number,
    @Query('offset') offset?: number,
  ) {
    return this.mlService.buscarProdutos(query, limite ?? 20, offset ?? 0);
  }

  // Buscar por categoria do ML
  @Get('buscar-categoria')
  buscarCategoria(
    @Query('slug') slug: string,
    @Query('limite') limite?: number,
  ) {
    const categoriaId = this.mlService.categoriasML[slug];
    if (!categoriaId) {
      return { erro: 'Categoria ML não encontrada', categoriasDisponiveis: Object.keys(this.mlService.categoriasML) };
    }
    return this.mlService.buscarPorCategoria(categoriaId, limite ?? 20);
  }

  // Importar produtos selecionados manualmente
  @Post('importar-selecionados')
  importarSelecionados(@Body() dto: ImportarSelecionadosDto) {
    return this.importacaoService.importarSelecionados(dto.mlIds, dto.categoriaId);
  }

  // Importar automaticamente por categoria
  @Post('importar-categoria')
  importarCategoria(@Body() dto: ImportarCategoriaDto) {
    return this.importacaoService.importarPorCategoria(
      dto.categoriaMLSlug as any,
      dto.categoriaId,
      dto.limite ?? 10,
    );
  }

  // Importar todas as categorias automaticamente
  @Post('importar-tudo')
  importarTudo(@Body() body: { limite?: number }) {
    return this.importacaoService.importarTodasCategorias(body.limite ?? 5);
  }

  // Listar categorias ML disponíveis
  @Get('categorias-ml')
  categoriasML() {
    return this.mlService.categoriasML;
  }
}
