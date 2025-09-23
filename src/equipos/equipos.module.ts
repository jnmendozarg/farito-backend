import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { Computadora } from './entities/computadora';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Impresora } from './entities/impresora.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Computadora, Impresora])],
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [TypeOrmModule]
})
export class EquiposModule {}
