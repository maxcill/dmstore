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

  constructor(private readonly http: HttpClient) {}

  buscar(query: string, limite = 20, offset = 0): Observable<MLBuscaResult> {
    const params = new HttpParams()
      .set('q', query)
      .set('limite', limite)
      .set('offset', offset);
    return this.http.get<MLBuscaResult>(`${this.baseUrl}/buscar`, { params });
  }

  buscarCategoria(slug: string, limite = 20): Observable<MLBuscaResult> {
    const params = new HttpParams().set('slug', slug).set('limite', limite);
    return this.http.get<MLBuscaResult>(`${this.baseUrl}/buscar-categoria`, { params });
  }

  importarSelecionados(mlIds: string[], categoriaId: string): Observable<{ importados: number; erros: string[] }> {
    return this.http.post<{ importados: number; erros: string[] }>(
      `${this.baseUrl}/importar-selecionados`,
      { mlIds, categoriaId },
    );
  }

  importarCategoria(categoriaMLSlug: string, categoriaId: string, limite: number) {
  console.log('Enviando:', { categoriaMLSlug, categoriaId, limite }); // debug
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
