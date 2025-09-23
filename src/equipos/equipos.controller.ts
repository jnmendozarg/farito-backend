import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateComputadoraDto, CreateImpresoraDto } from './dto/create-equipo.dto';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post('impresora')
  crearImpresora(@Body() createImpresoraDto: CreateImpresoraDto) {
    return this.equiposService.crearImpresora(createImpresoraDto);
  }

  @Post('computadora')
  crearComputadora(@Body() createComputadoraDto: CreateComputadoraDto) {
    return this.equiposService.crearComputadora(createComputadoraDto);
  }
}
