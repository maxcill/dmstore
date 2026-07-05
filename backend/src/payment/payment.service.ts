import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.stripe = new Stripe(secretKey || 'sk_test_placeholder', {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createPaymentIntent(pedidoId: string, usuarioId: string) {
    const pedido = await this.ordersService.findOne(pedidoId);

    if (!pedido) {
      throw new BadRequestException('Pedido não encontrado');
    }

    if (pedido.usuario.id !== usuarioId) {
      throw new ForbiddenException('Você não tem acesso a este pedido');
    }

    const valorEmCentavos = Math.round(Number(pedido.total) * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: valorEmCentavos,
      currency: 'brl',
      metadata: {
        pedidoId: pedido.id,
        numeroPedido: pedido.numeroPedido,
      },
    });

    await this.ordersService.setPaymentIntent(pedido.id, paymentIntent.id);

    return {
      clientSecret: paymentIntent.client_secret,
      valor: pedido.total,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException('Assinatura de webhook inválida');
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.ordersService.markAsPaid(paymentIntent.id);
    }

    return { recebido: true };
  }
}
