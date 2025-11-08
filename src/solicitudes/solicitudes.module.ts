import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Solicitud } from './solicitudes.entity';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solIcitudes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Solicitud])],
  controllers: [SolicitudesController],
  providers: [SolicitudesService]
})
export class SolicitudesModule {}
