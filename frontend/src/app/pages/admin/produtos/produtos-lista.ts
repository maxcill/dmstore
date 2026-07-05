import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Produto } from '../../../core/models/models';

@Component({
  selector: 'app-admin-produtos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produtos-lista.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminProdutosListaComponent implements OnInit {
  readonly produtos = signal<Produto[]>([]);
  readonly carregando = signal(true);

  constructor(private readonly productsService: ProductsService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.productsService.listarTodosAdmin().subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  remover(id: string): void {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    this.productsService.remover(id).subscribe(() => {
      this.produtos.update((lista) => lista.filter((p) => p.id !== id));
    });
  }
}
