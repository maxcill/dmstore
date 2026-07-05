import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Produto } from '../../core/models/models';

@Component({
  selector: 'app-produto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produto.html',
  styleUrl: './produto.scss',
})
export class ProdutoComponent implements OnInit {
  readonly produto = signal<Produto | null>(null);
  readonly carregando = signal(true);
  readonly quantidade = signal(1);
  readonly adicionando = signal(false);
  readonly mensagem = signal('');

  constructor(
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.carregando.set(true);
      this.productsService.buscarPorSlug(params['slug']).subscribe({
        next: (produto) => {
          this.produto.set(produto);
          this.carregando.set(false);
        },
        error: () => {
          this.produto.set(null);
          this.carregando.set(false);
        },
      });
    });
  }

  especificacoesArray(): { chave: string; valor: string }[] {
    const specs = this.produto()?.especificacoes;
    if (!specs) return [];
    return Object.entries(specs).map(([chave, valor]) => ({ chave, valor }));
  }

  alterarQuantidade(delta: number): void {
    const atual = this.produto();
    const nova = this.quantidade() + delta;
    if (nova >= 1 && (!atual || nova <= atual.estoque)) {
      this.quantidade.set(nova);
    }
  }

  adicionarAoCarrinho(): void {
    if (!this.authService.estaLogado()) {
      this.router.navigate(['/login']);
      return;
    }

    const produto = this.produto();
    if (!produto) return;

    this.adicionando.set(true);
    this.cartService.adicionarItem(produto.id, this.quantidade()).subscribe({
      next: () => {
        this.adicionando.set(false);
        this.mensagem.set('Produto adicionado ao carrinho!');
        setTimeout(() => this.mensagem.set(''), 3000);
      },
      error: (erro) => {
        this.adicionando.set(false);
        this.mensagem.set(erro.error?.message ?? 'Erro ao adicionar produto.');
      },
    });
  }
}
