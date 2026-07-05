import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createFromCart(user.id, dto);
  }

  @Get('meus-pedidos')
  findMine(@CurrentUser() user: { id: string }) {
    return this.ordersService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: string; role: UserRole },
    @Param('id') id: string,
  ) {
    return this.ordersService.findOneForUser(id, user.id, user.role);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.ordersService.findAllAdmin();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
