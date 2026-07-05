import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltroProdutos, Produto, ProdutosPaginados } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = `${environment.apiUrl}/produtos`;

  constructor(private readonly http: HttpClient) {}

  listar(filtro: FiltroProdutos = {}): Observable<ProdutosPaginados> {
    let params = new HttpParams();

    Object.entries(filtro).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, String(valor));
      }
    });

    return this.http.get<ProdutosPaginados>(this.baseUrl, { params });
  }

  buscarPorSlug(slug: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.baseUrl}/slug/${slug}`);
  }

  buscarPorId(id: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.baseUrl}/${id}`);
  }

  listarTodosAdmin(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.baseUrl}/admin/todos`);
  }

  criar(dados: Partial<Produto> & { categoriaId: string }): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, dados);
  }

  atualizar(
    id: string,
    dados: Partial<Produto> & { categoriaId?: string },
  ): Observable<Produto> {
    return this.http.patch<Produto>(`${this.baseUrl}/${id}`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
