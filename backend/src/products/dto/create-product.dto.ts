import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  MaxLength,
  IsUUID,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(180)
  nome: string;

  @IsString()
  descricao: string;

  @IsString()
  @MaxLength(100)
  marca: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precoPromocional?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estoque: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagens?: string[];

  @IsOptional()
  @IsObject()
  especificacoes?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsBoolean()
  destaque?: boolean;

  @IsUUID()
  categoriaId: string;
}
