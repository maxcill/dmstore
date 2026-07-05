import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Carrinho } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly baseUrl = `${environment.apiUrl}/carrinho`;
  private readonly carrinhoSignal = signal<Carrinho | null>(null);

  readonly carrinho = this.carrinhoSignal.asReadonly();
  readonly totalItens = computed(() =>
    (this.carrinhoSignal()?.itens ?? []).reduce((acc, item) => acc + item.quantidade, 0),
  );
  readonly subtotal = computed(() =>
    (this.carrinhoSignal()?.itens ?? []).reduce(
      (acc, item) =>
        acc + Number(item.produto.precoPromocional ?? item.produto.preco) * item.quantidade,
      0,
    ),
  );

  constructor(private readonly http: HttpClient) {}

  carregar(): Observable<Carrinho> {
    return this.http
      .get<Carrinho>(this.baseUrl)
      .pipe(tap((carrinho) => this.carrinhoSignal.set(carrinho)));
  }

  adicionarItem(produtoId: string, quantidade: number): Observable<Carrinho> {
    return this.http
      .post<Carrinho>(`${this.baseUrl}/itens`, { produtoId, quantidade })
      .pipe(tap((carrinho) => this.carrinhoSignal.set(carrinho)));
  }

  atualizarItem(itemId: string, quantidade: number): Observable<Carrinho> {
    return this.http
      .patch<Carrinho>(`${this.baseUrl}/itens/${itemId}`, { quantidade })
      .pipe(tap((carrinho) => this.carrinhoSignal.set(carrinho)));
  }

  removerItem(itemId: string): Observable<Carrinho> {
    return this.http
      .delete<Carrinho>(`${this.baseUrl}/itens/${itemId}`)
      .pipe(tap((carrinho) => this.carrinhoSignal.set(carrinho)));
  }

  limpar(): Observable<void> {
    return this.http.delete<void>(this.baseUrl).pipe(tap(() => this.carrinhoSignal.set(null)));
  }
}
