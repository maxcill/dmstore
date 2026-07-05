import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Categoria, FiltroProdutos, ProdutosPaginados } from '../../core/models/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class CatalogoComponent implements OnInit {
  readonly categorias = signal<Categoria[]>([]);
  readonly resultado = signal<ProdutosPaginados | null>(null);
  readonly carregando = signal(true);

  filtro: FiltroProdutos = {
    pagina: 1,
    limite: 12,
    ordenarPor: 'recentes',
  };

  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.categoriesService.listar().subscribe((categorias) => this.categorias.set(categorias));

    this.route.queryParams.subscribe((params) => {
      this.filtro = {
        ...this.filtro,
        busca: params['busca'] ?? undefined,
        categoriaId: params['categoriaId'] ?? undefined,
      };
      this.buscarProdutos();
    });
  }

  aplicarFiltros(): void {
    this.filtro.pagina = 1;
    this.buscarProdutos();
  }

  irParaPagina(pagina: number): void {
    this.filtro.pagina = pagina;
    this.buscarProdutos();
  }

  limparFiltros(): void {
    this.filtro = { pagina: 1, limite: 12, ordenarPor: 'recentes' };
    this.router.navigate(['/catalogo']);
    this.buscarProdutos();
  }

  private buscarProdutos(): void {
    this.carregando.set(true);
    this.productsService.listar(this.filtro).subscribe({
      next: (resposta) => {
        this.resultado.set(resposta);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
