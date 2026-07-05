export enum UserRole {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  ENVIADO = 'enviado',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  icone?: string;
}

export interface Produto {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  marca: string;
  preco: number;
  precoPromocional?: number | null;
  estoque: number;
  imagens: string[];
  especificacoes?: Record<string, string>;
  ativo: boolean;
  destaque: boolean;
  avaliacaoMedia: number;
  categoria: Categoria;
  criadoEm: string;
}

export interface ProdutosPaginados {
  produtos: Produto[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface FiltroProdutos {
  busca?: string;
  categoriaId?: string;
  marca?: string;
  precoMin?: number;
  precoMax?: number;
  destaque?: boolean;
  ordenarPor?: 'preco_asc' | 'preco_desc' | 'recentes' | 'avaliacao';
  pagina?: number;
  limite?: number;
}

export interface CartItem {
  id: string;
  produto: Produto;
  quantidade: number;
}

export interface Carrinho {
  id: string;
  itens: CartItem[];
}

export interface EnderecoEntrega {
  destinatario: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface OrderItem {
  id: string;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: string;
  numeroPedido: string;
  itens: OrderItem[];
  subtotal: number;
  valorFrete: number;
  total: number;
  status: OrderStatus;
  enderecoEntrega: EnderecoEntrega;
  criadoEm: string;
}
