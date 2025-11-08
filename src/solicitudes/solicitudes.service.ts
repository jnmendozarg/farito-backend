import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './solicitudes.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudRepo: Repository<Solicitud>
  ) {}

  async crearSolicitud(dto: CreateSolicitudDto) {
    let fechaReparacion: Date | null = null;

    if (dto.fechaRegistro) {
      const fechaParts = dto.fechaRegistro.split('/');
      if (fechaParts.length !== 3) {
        throw new BadRequestException('Formato de fecha incorrecto, debe ser dd/MM/yyyy');
      }

      // Convertir a Date: new Date(año, mes (0-indexado), día)
      fechaReparacion = new Date(+fechaParts[2], +fechaParts[1] - 1, +fechaParts[0]);
    }

    const solicitud = this.solicitudRepo.create({
      marca: dto.marca,
      modelo: dto.modelo,
      cantidad: dto.cantidad,
      descripcion: dto.descripcion,
      fechaReparacion
    });

    return await this.solicitudRepo.save(solicitud);
  }

  async obtenerTodas(): Promise<Solicitud[]> {
    return this.solicitudRepo.find();
  }

  async obtenerPorId(id: number) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException(`No se encontró la solicitud con ID ${id}`);
    }
    return solicitud;
  }

  async actualizarEstado(id: number, nuevoEstado: string) {
    const solicitud = await this.obtenerPorId(id);

    const estadosPermitidos = ['Pendiente', 'Rechazado', 'Aprobado'];
    const estadoFormateado = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1).toLowerCase();

    if (!estadosPermitidos.includes(estadoFormateado)) {
      throw new BadRequestException(`Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`);
    }

    solicitud.estado = estadoFormateado;
    return await this.solicitudRepo.save(solicitud);
  }
}
