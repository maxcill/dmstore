import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
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
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async getAccessToken(): Promise<string | null> {
    const appId = this.configService.get<string>('ML_APP_ID');
    const secret = this.configService.get<string>('ML_CLIENT_SECRET');

    if (!appId || !secret) {
      this.logger.warn('ML_APP_ID ou ML_CLIENT_SECRET não configurados');
      return null;
    }

    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      this.logger.log('Obtendo novo token OAuth do ML...');
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', appId);
      params.append('client_secret', secret);

      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/oauth/token`,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
          },
        ),
      );

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
      this.logger.log('Token ML obtido com sucesso!');
      return this.accessToken;
    } catch (error) {
      this.logger.error('Erro ao obter token ML:', error?.response?.data ?? error.message);
      return null;
    }
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'DMStore/1.0',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async buscarProdutos(query: string, limite = 20, offset = 0): Promise<MLBuscaResult> {
    const headers = await this.buildHeaders();
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<MLBuscaResult>(`${this.baseUrl}/sites/MLB/search`, {
          params: { q: query, limit: limite, offset, condition: 'new' },
          headers,
        }),
      );
      return data;
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message ?? error.message;
      this.logger.error(`Erro ao buscar ML (${status}):`, msg);
      throw new Error(`Erro ao buscar no ML: ${msg}`);
    }
  }

  async buscarPorCategoria(categoriaML: string, limite = 20): Promise<MLBuscaResult> {
    const headers = await this.buildHeaders();
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<MLBuscaResult>(`${this.baseUrl}/sites/MLB/search`, {
          params: { category: categoriaML, limit: limite, sort: 'relevance', condition: 'new' },
          headers,
        }),
      );
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message ?? error.message;
      throw new Error(`Erro ao buscar categoria ML: ${msg}`);
    }
  }

  async buscarDetalhes(mlId: string): Promise<MLProduto> {
    const headers = await this.buildHeaders();
    const { data } = await firstValueFrom(
      this.httpService.get<MLProduto>(`${this.baseUrl}/items/${mlId}`, { headers }),
    );
    return data;
  }

  readonly categoriasML: Record<string, string> = {
    celulares: 'MLB1055',
    computadores: 'MLB1648',
    notebooks: 'MLB1652',
    monitores: 'MLB1430',
    acessorios: 'MLB1051',
  };
}
