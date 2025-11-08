import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, ParseIntPipe, Put } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  async crearSolicitud(@Body() dto: CreateSolicitudDto) {
    return this.solicitudesService.crearSolicitud(dto);
  }

  @Get()
  async obtenerSolicitudes() {
    return this.solicitudesService.obtenerTodas();
  }
  @Get(':id')
  async obtenerSolicitudPorId(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.obtenerPorId(id);
  }

  @Put(':id/estado')
  async actualizarEstado(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: string) {
    return this.solicitudesService.actualizarEstado(id, estado);
  }
}
