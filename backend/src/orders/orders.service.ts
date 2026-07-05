import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { OrderStatus } from '../common/enums/order-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

const VALOR_FRETE_PADRAO = 19.9;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async createFromCart(usuarioId: string, dto: CreateOrderDto): Promise<Order> {
    const carrinho = await this.cartService.getOrCreateCart(usuarioId);

    if (!carrinho.itens || carrinho.itens.length === 0) {
      throw new BadRequestException('O carrinho está vazio');
    }

    for (const item of carrinho.itens) {
      if (item.produto.estoque < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto "${item.produto.nome}"`,
        );
      }
    }

    const usuario = await this.usersService.findById(usuarioId);

    const subtotal = carrinho.itens.reduce(
      (acc, item) =>
        acc + Number(item.produto.precoPromocional ?? item.produto.preco) * item.quantidade,
      0,
    );

    const total = subtotal + VALOR_FRETE_PADRAO;
    const numeroPedido = `DM${Date.now()}`;

    const pedido = this.ordersRepository.create({
      numeroPedido,
      usuario,
      subtotal,
      valorFrete: VALOR_FRETE_PADRAO,
      total,
      status: OrderStatus.PENDENTE,
      enderecoEntrega: dto.enderecoEntrega,
    });

    const pedidoSalvo = await this.ordersRepository.save(pedido);

    const itensPedido = carrinho.itens.map((item) =>
      this.orderItemsRepository.create({
        pedido: pedidoSalvo,
        produto: item.produto,
        quantidade: item.quantidade,
        precoUnitario: Number(item.produto.precoPromocional ?? item.produto.preco),
      }),
    );

    await this.orderItemsRepository.save(itensPedido);

    for (const item of carrinho.itens) {
      await this.productsService.baixarEstoque(item.produto.id, item.quantidade);
    }

    await this.cartService.clearCart(usuarioId);

    return this.findOne(pedidoSalvo.id);
  }

  async findOne(id: string): Promise<Order> {
    const pedido = await this.ordersRepository.findOne({ where: { id } });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return pedido;
  }

  async findOneForUser(id: string, usuarioId: string, role: UserRole): Promise<Order> {
    const pedido = await this.findOne(id);

    if (role !== UserRole.ADMIN && pedido.usuario.id !== usuarioId) {
      throw new ForbiddenException('Você não tem acesso a este pedido');
    }

    return pedido;
  }

  async findAllByUser(usuarioId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { usuario: { id: usuarioId } },
      order: { criadoEm: 'DESC' },
    });
  }

  async findAllAdmin(): Promise<Order[]> {
    return this.ordersRepository.find({ order: { criadoEm: 'DESC' } });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const pedido = await this.findOne(id);
    pedido.status = dto.status;
    return this.ordersRepository.save(pedido);
  }

  async setPaymentIntent(id: string, paymentIntentId: string): Promise<void> {
    await this.ordersRepository.update(id, {
      stripePaymentIntentId: paymentIntentId,
    });
  }

  async markAsPaid(stripePaymentIntentId: string): Promise<void> {
    const pedido = await this.ordersRepository.findOne({
      where: { stripePaymentIntentId },
    });

    if (pedido) {
      pedido.status = OrderStatus.PAGO;
      await this.ordersRepository.save(pedido);
    }
  }
}
