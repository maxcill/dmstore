import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { EnderecoEntregaDto } from './endereco-entrega.dto';

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => EnderecoEntregaDto)
  enderecoEntrega: EnderecoEntregaDto;
}
