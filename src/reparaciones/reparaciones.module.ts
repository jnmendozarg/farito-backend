import { Module } from '@nestjs/common';
import { ReparacionesService } from './reparaciones.service';
import { ReparacionesController } from './reparaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Computadora } from 'src/equipos/entities/computadora';
import { EquiposModule } from 'src/equipos/equipos.module';
import { Impresora } from 'src/equipos/entities/impresora.entity';
import { Reparacion } from './entities/reparacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reparacion, Computadora, Impresora]), EquiposModule],
  controllers: [ReparacionesController],
  providers: [ReparacionesService]
})
export class ReparacionesModule {}
