import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
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
  
  // Lock para evitar múltiplas requisições de token ao mesmo tempo
  private tokenPromise: Promise<string | null> | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    // private readonly cacheManager: Cache // Dica: Injete o Redis ou Banco aqui futuramente
  ) {}

  readonly categoriasML: Record<string, string> = {
    celulares: 'MLB1055',
    computadores: 'MLB1648',
    notebooks: 'MLB1652',
    monitores: 'MLB1430',
    acessorios: 'MLB1051',
  };

  /**
   * Obtém e gerencia o ciclo de vida do Token OAuth do ML
   */
  private async getAccessToken(): Promise<string | null> {
    const appId = this.configService.get<string>('ML_APP_ID');
    const secret = this.configService.get<string>('ML_CLIENT_SECRET');

    if (!appId || !secret) {
      this.logger.error('ML_APP_ID ou ML_CLIENT_SECRET ausentes nas variáveis de ambiente');
      return null;
    }

    // 1. BUSCA DO CACHE PERSISTENTE (Simulado)
    // Substitua pelo seu repositório de banco ou Redis para não perder o token no reboot
    const cachedToken = global.__ml_token; 
    const cachedExpiry = global.__ml_expiry;

    // Margem de segurança de 5 minutos (300000ms)
    if (cachedToken && Date.now() < (cachedExpiry - 300000)) {
      return cachedToken;
    }

    // 2. EVITA THREAD LOCKS (Se houver 50 requisições simultâneas, faz apenas 1 chamada HTTP de token)
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = (async () => {
      try {
        this.logger.log('Emitindo chamada OAuth Client Credentials para o Mercado Livre...');
        
        const params = new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: appId,
          client_secret: secret,
        });

        const { data } = await firstValueFrom(
          this.httpService.post(`${this.baseUrl}/oauth/token`, params.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
          }),
        );

        // Salva globalmente ou no Redis/Banco
        global.__ml_token = data.access_token;
        global.__ml_expiry = Date.now() + data.expires_in * 1000;

        this.logger.log('Novo Access Token do ML gerado e cacheado.');
        return data.access_token;
      } catch (error) {
        const errorData = error?.response?.data ?? error.message;
        this.logger.error('Falha crítica ao renovar credenciais no Mercado Livre:', errorData);
        return null;
      } finally {
        this.tokenPromise = null; // Libera o lock
      }
    })();

    return this.tokenPromise;
  }

  /**
   * Constrói cabeçalhos padrão injetando o Bearer Token dinamicamente
   */
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

  /**
   * Executa busca textual de produtos ativos no Mercado Livre Brasil
   */
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
      this.tratarErroMl(error, 'buscar produtos');
    }
  }

  /**
   * Filtra listagem de produtos com base no ID da categoria nativa do ML
   */
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
      this.tratarErroMl(error, `buscar categoria ${categoriaML}`);
    }
  }

  /**
   * Obtém a carga completa de dados de um item específico por ID
   */
  async buscarDetalhes(mlId: string): Promise<MLProduto> {
    const headers = await this.buildHeaders();
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<MLProduto>(`${this.baseUrl}/items/${mlId}`, { headers }),
      );
      return data;
    } catch (error) {
      this.tratarErroMl(error, `buscar detalhes do item ${mlId}`);
    }
  }

  /**
   * Centralizador de tratamento de erros HTTP Axios -> NestJS Exception
   */
  private tratarErroMl(error: any, acao: string): never {
    const status = error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const mensagem = error?.response?.data?.message ?? error.message;
    
    this.logger.error(`[Erro ML] Falha ao ${acao} (${status}): ${mensagem}`);
    
    throw new HttpException(
      { error: `Falha na integração com Mercado Livre ao ${acao}.`, detalhes: mensagem },
      status,
    );
  }
}
