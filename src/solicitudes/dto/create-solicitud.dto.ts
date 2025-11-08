import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateSolicitudDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsInt()
  cantidad: number;

  @IsOptional()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  fechaRegistro?: string; // viene como "dd/MM/yyyy"
}
