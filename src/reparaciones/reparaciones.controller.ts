import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReparacionesService } from './reparaciones.service';

import { CrearFallaDto, CrearReparacionDto } from './dto/create-reparacion.dto';

@Controller('reparaciones')
export class ReparacionesController {
  constructor(private readonly reparacionesService: ReparacionesService) {}

  @Post()
  async registrarFalla(@Body() dto: CrearFallaDto) {
    return this.reparacionesService.registrarFalla(dto);
  }

  /* @Patch(':codigoEquipo')
  async actualizarReparacion(
    @Param('codigoEquipo') codigoEquipo: string,
    @Body() crearReparacionDto: CrearReparacionDto
  ) {
    return this.reparacionesService.actualizarReparacion(codigoEquipo, crearReparacionDto);
  } */

  @Patch('')
  registrar(@Body() dto: CrearReparacionDto) {
    return this.reparacionesService.registrarReparacion(dto);
  }
}
