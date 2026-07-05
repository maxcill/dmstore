import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pagamento')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('criar-intent')
  createPaymentIntent(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createPaymentIntent(dto.pedidoId, user.id);
  }

  @Post('webhook')
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request,
  ) {
    return this.paymentService.handleWebhook(signature, request.body);
  }
}
