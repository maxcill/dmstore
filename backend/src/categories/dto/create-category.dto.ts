import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icone?: string;
}
