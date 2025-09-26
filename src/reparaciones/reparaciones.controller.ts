import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
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

  @Get('abierta')
  async abierta(@Query('codigo') codigo: string) {
    console.log(codigo);
    if (!codigo?.trim()) throw new BadRequestException('codigo es requerido');
    const rep = await this.reparacionesService.encontrarAbiertaPorCodigo(codigo.trim());
    if (!rep) return { abierta: false };
    return { abierta: true, id: rep.id, estado: rep.estado };
  }

  /** GET /reparaciones/historial?codigo=C-001 */
  @Get('historial')
  async historial(@Query('codigo') codigo: string) {
    if (!codigo?.trim()) {
      throw new BadRequestException('codigo es requerido');
    }
    return this.reparacionesService.historialPorCodigo(codigo.trim());
  }
}
