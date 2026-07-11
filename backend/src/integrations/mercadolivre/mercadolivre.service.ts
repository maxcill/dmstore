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

    if (!appId || !secret) return null;

    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/oauth/token`,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: appId,
            client_secret: secret,
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      this.logger.error('Erro ao obter token ML:', error.message);
      return null;
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async buscarProdutos(
    query: string,
    limite = 20,
    offset = 0,
  ): Promise<MLBuscaResult> {
    try {
      const headers = await this.getHeaders();
      const { data } = await firstValueFrom(
        this.httpService.get<MLBuscaResult>(
          `${this.baseUrl}/sites/MLB/search`,
          {
            params: { q: query, limit: limite, offset, condition: 'new' },
            headers,
          },
        ),
      );
      return data;
    } catch (error) {
      this.logger.error('Erro ao buscar no ML:', error.message);
      throw error;
    }
  }

  async buscarPorCategoria(
    categoriaML: string,
    limite = 20,
  ): Promise<MLBuscaResult> {
    try {
      const headers = await this.getHeaders();
      const { data } = await firstValueFrom(
        this.httpService.get<MLBuscaResult>(
          `${this.baseUrl}/sites/MLB/search`,
          {
            params: { category: categoriaML, limit: limite, sort: 'relevance', condition: 'new' },
            headers,
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
    const headers = await this.getHeaders();
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
