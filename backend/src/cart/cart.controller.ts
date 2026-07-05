import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('carrinho')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: { id: string }) {
    return this.cartService.getOrCreateCart(user.id);
  }

  @Post('itens')
  addItem(@CurrentUser() user: { id: string }, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('itens/:itemId')
  updateItem(
    @CurrentUser() user: { id: string },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, dto);
  }

  @Delete('itens/:itemId')
  removeItem(
    @CurrentUser() user: { id: string },
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  clearCart(@CurrentUser() user: { id: string }) {
    return this.cartService.clearCart(user.id);
  }
}
