import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoLivreService, MLProduto } from './mercadolivre.service';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { gerarSlug } from '../../common/utils/slug.util';

@Injectable()
export class ImportacaoService {
  private readonly logger = new Logger(ImportacaoService.name);

  constructor(
    private readonly mlService: MercadoLivreService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // Converter produto ML para formato da DMStore
  private converterProduto(mlProduto: MLProduto, categoria: Category): Partial<Product> {
    const especificacoes: Record<string, string> = {};

    if (mlProduto.attributes) {
      const atributosRelevantes = [
        'BRAND', 'MODEL', 'RAM', 'STORAGE_CAPACITY',
        'PROCESSOR_MODEL', 'DISPLAY_SIZE', 'BATTERY_CAPACITY',
        'MAIN_COLOR', 'OPERATING_SYSTEM',
      ];

      for (const attr of mlProduto.attributes) {
        if (atributosRelevantes.includes(attr.id) && attr.value_name) {
          especificacoes[attr.name] = attr.value_name;
        }
      }
    }

    const marca = mlProduto.attributes?.find(
      (a) => a.id === 'BRAND',
    )?.value_name ?? mlProduto.seller?.nickname ?? 'Importado';

    // Pegar imagens de maior qualidade
    const imagens = mlProduto.pictures?.length
      ? mlProduto.pictures.slice(0, 5).map((p) =>
          p.url.replace('-I.jpg', '-O.jpg'),
        )
      : [mlProduto.thumbnail.replace('-I.jpg', '-O.jpg')];

    let slug = gerarSlug(mlProduto.title);

    return {
      nome: mlProduto.title,
      slug,
      descricao: `${mlProduto.title}. Produto novo importado do Mercado Livre. Acesse para mais detalhes.`,
      marca,
      preco: mlProduto.price,
      precoPromocional: mlProduto.original_price && mlProduto.original_price > mlProduto.price
        ? mlProduto.price
        : null,
      estoque: Math.min(mlProduto.available_quantity ?? 10, 100),
      imagens,
      especificacoes,
      categoria,
      ativo: true,
      destaque: false,
      avaliacaoMedia: 0,
    };
  }

  // Importar produtos selecionados manualmente
  async importarSelecionados(
    mlIds: string[],
    categoriaId: string,
  ): Promise<{ importados: number; erros: string[] }> {
    if (!categoriaId) {
  throw new Error('categoriaId é obrigatório');
}

const categoria = await this.categoryRepository.findOne({
  where: { id: categoriaId },
});

if (!categoria) {
  throw new Error('Categoria não encontrada');
}

    let importados = 0;
    const erros: string[] = [];

    for (const mlId of mlIds) {
      try {
        const mlProduto = await this.mlService.buscarDetalhes(mlId);
        const dadosProduto = this.converterProduto(mlProduto, categoria);

        // Verificar se já existe
        const existente = await this.productRepository.findOne({
          where: { slug: dadosProduto.slug },
        });

        if (existente) {
          dadosProduto.slug = `${dadosProduto.slug}-${Date.now().toString().slice(-4)}`;
        }

        await this.productRepository.save(
          this.productRepository.create(dadosProduto),
        );
        importados++;
      } catch (error) {
        erros.push(`Erro ao importar ${mlId}: ${error.message}`);
        this.logger.error(`Erro ao importar ${mlId}:`, error.message);
      }
    }

    return { importados, erros };
  }

  // Importação automática por categoria
  async importarPorCategoria(
    categoriaMLSlug: keyof typeof this.mlService.categoriasML,
    categoriaId: string,
    limite = 10,
  ): Promise<{ importados: number; erros: string[] }> {
    const categoria = await this.categoryRepository.findOne({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }

    const categoriaMLId = this.mlService.categoriasML[categoriaMLSlug];
    const resultado = await this.mlService.buscarPorCategoria(categoriaMLId, limite);

    let importados = 0;
    const erros: string[] = [];

    for (const mlProduto of resultado.results) {
      try {
        const dadosProduto = this.converterProduto(mlProduto, categoria);

        const existente = await this.productRepository.findOne({
          where: { slug: dadosProduto.slug },
        });

        if (existente) {
          dadosProduto.slug = `${dadosProduto.slug}-${Date.now().toString().slice(-4)}`;
        }

        await this.productRepository.save(
          this.productRepository.create(dadosProduto),
        );
        importados++;
      } catch (error) {
        erros.push(`Erro ao importar ${mlProduto.id}: ${error.message}`);
      }
    }

    this.logger.log(`Importação automática: ${importados} produtos importados de ${categoriaMLSlug}`);
    return { importados, erros };
  }

  // Importação automática de TODAS as categorias
  async importarTodasCategorias(limite = 5): Promise<Record<string, number>> {
    const categorias = await this.categoryRepository.find();
    const resultado: Record<string, number> = {};

    const mapeamento: Record<string, keyof typeof this.mlService.categoriasML> = {
      celulares: 'celulares',
      computadores: 'computadores',
      notebooks: 'notebooks',
      monitores: 'monitores',
      acessorios: 'acessorios',
    };

    for (const categoria of categorias) {
      const mlSlug = mapeamento[categoria.slug];
      if (!mlSlug) continue;

      try {
        const { importados } = await this.importarPorCategoria(
          mlSlug,
          categoria.id,
          limite,
        );
        resultado[categoria.nome] = importados;
      } catch (error) {
        this.logger.error(`Erro ao importar categoria ${categoria.nome}:`, error.message);
        resultado[categoria.nome] = 0;
      }
    }

    return resultado;
  }
}
