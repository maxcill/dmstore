import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface MLProduto {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail: string;
  pictures?: { url: string }[];
  condition: string;
  permalink: string;
  seller: { nickname: string };
  attributes: { id: string; name: string; value_name: string }[];
  available_quantity: number;
  category_id: string;
}

export interface MLBuscaResult {
  results: MLProduto[];
  paging: { total: number; limit: number; offset: number };
}

@Injectable()
export class MercadoLivreService {
  private readonly logger = new Logger(MercadoLivreService.name);
  private readonly baseUrl = 'https://api.mercadolibre.com';

  constructor(private readonly httpService: HttpService) {}

  async buscarProdutos(
    query: string,
    limite = 20,
    offset = 0,
  ): Promise<MLBuscaResult> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<MLBuscaResult>(
          `${this.baseUrl}/sites/MLB/search`,
          {
            params: {
              q: query,
              limit: limite,
              offset,
              condition: 'new',
            },
          },
        ),
      );
      return data;
    } catch (error) {
      this.logger.error('Erro ao buscar no Mercado Livre:', error.message);
      throw error;
    }
  }

  async buscarPorCategoria(
    categoriaML: string,
    limite = 20,
  ): Promise<MLBuscaResult> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<MLBuscaResult>(
          `${this.baseUrl}/sites/MLB/search`,
          {
            params: {
              category: categoriaML,
              limit: limite,
              sort: 'relevance',
              condition: 'new',
            },
          },
        ),
      );
      return data;
    } catch (error) {
      this.logger.error('Erro ao buscar categoria ML:', error.message);
      throw error;
    }
  }

  async buscarDetalhes(mlId: string): Promise<MLProduto> {
    const { data } = await firstValueFrom(
      this.httpService.get<MLProduto>(`${this.baseUrl}/items/${mlId}`),
    );
    return data;
  }

  // Categorias de informática do ML
  readonly categoriasML = {
    celulares: 'MLB1055',
    computadores: 'MLB1648',
    notebooks: 'MLB1652',
    monitores: 'MLB1430',
    acessorios: 'MLB1051',
  };
}
