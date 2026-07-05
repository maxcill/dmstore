import { IsString, MaxLength, IsOptional } from 'class-validator';

export class EnderecoEntregaDto {
  @IsString()
  @MaxLength(120)
  destinatario: string;

  @IsString()
  @MaxLength(150)
  rua: string;

  @IsString()
  @MaxLength(20)
  numero: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complemento?: string;

  @IsString()
  @MaxLength(100)
  bairro: string;

  @IsString()
  @MaxLength(100)
  cidade: string;

  @IsString()
  @MaxLength(2)
  estado: string;

  @IsString()
  @MaxLength(9)
  cep: string;
}
