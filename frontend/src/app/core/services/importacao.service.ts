import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MLProdutoResumo {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail: string;
  seller: { nickname: string };
  available_quantity: number;
  condition: string;
}

export interface MLBuscaResult {
  results: MLProdutoResumo[];
  paging: { total: number; limit: number; offset: number };
}

@Injectable({ providedIn: 'root' })
export class ImportacaoService {
  private readonly baseUrl = `${environment.apiUrl}/admin/importacao`;
  private readonly mlUrl = 'https://api.mercadolibre.com';

  constructor(private readonly http: HttpClient) {}

  // Busca direto no ML pelo navegador (evita bloqueio 403)
  buscar(query: string, limite = 20, offset = 0): Observable<MLBuscaResult> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limite)
      .set('offset', offset)
      .set('condition', 'new')
      .set('site_id', 'MLB');
    return this.http.get<MLBuscaResult>(`${this.mlUrl}/sites/MLB/search`, { params });
  }

  buscarCategoria(slug: string, limite = 20): Observable<MLBuscaResult> {
    const categorias: Record<string, string> = {
      celulares: 'MLB1055',
      computadores: 'MLB1648',
      notebooks: 'MLB1652',
      monitores: 'MLB1430',
      acessorios: 'MLB1051',
    };
    const categoriaId = categorias[slug];
    const params = new HttpParams()
      .set('category', categoriaId)
      .set('limit', limite)
      .set('sort', 'relevance')
      .set('condition', 'new');
    return this.http.get<MLBuscaResult>(`${this.mlUrl}/sites/MLB/search`, { params });
  }

  importarSelecionados(mlIds: string[], categoriaId: string): Observable<{ importados: number; erros: string[] }> {
    return this.http.post<{ importados: number; erros: string[] }>(
      `${this.baseUrl}/importar-selecionados`,
      { mlIds, categoriaId },
    );
  }

  importarCategoria(categoriaMLSlug: string, categoriaId: string, limite: number): Observable<{ importados: number; erros: string[] }> {
    return this.http.post<{ importados: number; erros: string[] }>(
      `${this.baseUrl}/importar-categoria`,
      { categoriaMLSlug, categoriaId, limite },
    );
  }

  importarTudo(limite = 5): Observable<Record<string, number>> {
    return this.http.post<Record<string, number>>(
      `${this.baseUrl}/importar-tudo`,
      { limite },
    );
  }
}