import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.CatalogoComponent),
  },
  {
    path: 'categoria/:slug',
    loadComponent: () => import('./pages/categoria/categoria').then((m) => m.CategoriaComponent),
  },
  {
    path: 'produto/:slug',
    loadComponent: () => import('./pages/produto/produto').then((m) => m.ProdutoComponent),
  },
  {
    path: 'carrinho',
    loadComponent: () => import('./pages/carrinho/carrinho').then((m) => m.CarrinhoComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.RegistroComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'minha-conta',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/minha-conta/minha-conta').then((m) => m.MinhaContaComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./pages/pedidos/pedidos-lista').then((m) => m.PedidosListaComponent),
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./pages/pedidos/pedido-detalhe').then((m) => m.PedidoDetalheComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/layout/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'produtos',
        loadComponent: () => import('./pages/admin/produtos/produtos-lista').then((m) => m.AdminProdutosListaComponent),
      },
      {
        path: 'produtos/novo',
        loadComponent: () => import('./pages/admin/produtos/produto-form').then((m) => m.AdminProdutoFormComponent),
      },
      {
        path: 'produtos/:id',
        loadComponent: () => import('./pages/admin/produtos/produto-form').then((m) => m.AdminProdutoFormComponent),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/admin/categorias/categorias').then((m) => m.AdminCategoriasComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./pages/admin/pedidos/pedidos-admin').then((m) => m.AdminPedidosComponent),
      },
      {
        path: 'importacao',
        loadComponent: () => import('./pages/admin/importacao/importacao').then((m) => m.AdminImportacaoComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
