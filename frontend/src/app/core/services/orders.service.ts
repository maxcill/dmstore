import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnderecoEntrega, OrderStatus, Pedido } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(private readonly http: HttpClient) {}

  criar(enderecoEntrega: EnderecoEntrega): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, { enderecoEntrega });
  }

  meusPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/meus-pedidos`);
  }

  buscarPorId(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/${id}`);
  }

  listarTodosAdmin(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl);
  }

  atualizarStatus(id: string, status: OrderStatus): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.baseUrl}/${id}/status`, { status });
  }
}
