import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly baseUrl = `${environment.apiUrl}/categorias`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  criar(dados: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, dados);
  }

  atualizar(id: string, dados: Partial<Categoria>): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.baseUrl}/${id}`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
