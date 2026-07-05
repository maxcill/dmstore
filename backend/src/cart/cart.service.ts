import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async getOrCreateCart(usuarioId: string): Promise<Cart> {
    let carrinho = await this.cartRepository.findOne({
      where: { usuario: { id: usuarioId } },
    });

    if (!carrinho) {
      const usuario = await this.usersService.findById(usuarioId);
      carrinho = this.cartRepository.create({ usuario, itens: [] });
      carrinho = await this.cartRepository.save(carrinho);
    }

    return carrinho;
  }

  async addItem(usuarioId: string, dto: AddCartItemDto): Promise<Cart> {
    const carrinho = await this.getOrCreateCart(usuarioId);
    const produto = await this.productsService.findOne(dto.produtoId);

    if (produto.estoque < dto.quantidade) {
      throw new BadRequestException('Estoque insuficiente para este produto');
    }

    const itemExistente = carrinho.itens.find(
      (item) => item.produto.id === dto.produtoId,
    );

    if (itemExistente) {
      itemExistente.quantidade += dto.quantidade;
      await this.cartItemRepository.save(itemExistente);
    } else {
      const novoItem = this.cartItemRepository.create({
        carrinho,
        produto,
        quantidade: dto.quantidade,
      });
      await this.cartItemRepository.save(novoItem);
    }

    return this.getOrCreateCart(usuarioId);
  }

  async updateItem(
    usuarioId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const carrinho = await this.getOrCreateCart(usuarioId);
    const item = carrinho.itens.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    if (item.produto.estoque < dto.quantidade) {
      throw new BadRequestException('Estoque insuficiente para este produto');
    }

    item.quantidade = dto.quantidade;
    await this.cartItemRepository.save(item);

    return this.getOrCreateCart(usuarioId);
  }

  async removeItem(usuarioId: string, itemId: string): Promise<Cart> {
    const carrinho = await this.getOrCreateCart(usuarioId);
    const item = carrinho.itens.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    await this.cartItemRepository.remove(item);
    return this.getOrCreateCart(usuarioId);
  }

  async clearCart(usuarioId: string): Promise<void> {
    const carrinho = await this.getOrCreateCart(usuarioId);
    if (carrinho.itens.length > 0) {
      await this.cartItemRepository.remove(carrinho.itens);
    }
  }
}
