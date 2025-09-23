import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TipoImpresora } from '../entities/impresora.entity';

export class CreateImpresoraDto {
  @IsString()
  modelo: string;

  @IsEnum(TipoImpresora)
  tipo: TipoImpresora;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  marca: string;

  @IsString()
  software_o_driver: string;

  @IsString()
  compatibilidad: string;

  @IsString()
  conectividad: string;
}

export class CreateComputadoraDto {
  @IsString()
  marca: string;

  @IsString()
  procesador: string;

  @IsString()
  tipoAlmacenamiento: string;

  @IsString()
  ram: string;

  @IsString()
  sistemaOperativo: string;
}
