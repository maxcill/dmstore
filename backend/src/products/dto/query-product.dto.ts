import { IsOptional, IsString, IsNumber, IsUUID, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precoMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precoMax?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  destaque?: boolean;

  @IsOptional()
  @IsIn(['preco_asc', 'preco_desc', 'recentes', 'avaliacao'])
  ordenarPor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limite?: number = 12;
}
