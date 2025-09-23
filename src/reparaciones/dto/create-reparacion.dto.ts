import { IsEnum, IsString, IsOptional } from 'class-validator';

export class CrearFallaDto {
  @IsString()
  codigoEquipo: string;

  @IsString()
  tipoEvento: string;

  @IsString()
  descripcionProblema: string;

  @IsString()
  fechaRegistro: string;
}

export class CrearReparacionDto {
  @IsString()
  codigoEquipo: string;

  @IsString()
  fechaReparacion: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  accionesRealizadas?: string;

  @IsOptional()
  @IsString()
  tecnico?: string;
}
