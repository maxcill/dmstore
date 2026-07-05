import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CategoriesService } from '../../core/services/categories.service';
import { ProductsService } from '../../core/services/products.service';
import { Categoria, Produto } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
})
export class CategoriaComponent implements OnInit {
  readonly categoria = signal<Categoria | null>(null);
  readonly produtos = signal<Produto[]>([]);
  readonly carregando = signal(true);

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.carregando.set(true);
      this.buscarCategoriaEProdutos(params['slug']);
    });
  }

  private buscarCategoriaEProdutos(slug: string): void {
    this.categoriesService.listar().subscribe((categorias) => {
      const categoria = categorias.find((c) => c.slug === slug) ?? null;
      this.categoria.set(categoria);

      if (categoria) {
        this.productsService.listar({ categoriaId: categoria.id, limite: 24 }).subscribe({
          next: (resposta) => {
            this.produtos.set(resposta.produtos);
            this.carregando.set(false);
          },
          error: () => this.carregando.set(false),
        });
      } else {
        this.carregando.set(false);
      }
    });
  }
}
