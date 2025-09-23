import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Computadora } from 'src/equipos/entities/computadora';

import { Repository, IsNull, In } from 'typeorm';

import { Impresora } from 'src/equipos/entities/impresora.entity';
import { EstadoReparacion, Reparacion, TipoEquipo } from './entities/reparacion.entity';
import { CrearFallaDto, CrearReparacionDto } from './dto/create-reparacion.dto';

@Injectable()
export class ReparacionesService {
  constructor(
    @InjectRepository(Reparacion)
    private readonly reparacionRepo: Repository<Reparacion>,

    @InjectRepository(Computadora)
    private readonly computadoraRepo: Repository<Computadora>,

    @InjectRepository(Impresora)
    private readonly impresoraRepo: Repository<Impresora>
  ) {}

  async registrarFalla(dto: CrearFallaDto) {
    console.log(dto);
    let computadora: Computadora | null = null;
    let impresora: Impresora | null = null;
    let tipoEquipo: TipoEquipo;

    // 1. Identificar equipo por prefijo de código
    if (dto.codigoEquipo.startsWith('C-')) {
      computadora = await this.computadoraRepo.findOne({ where: { codigo: dto.codigoEquipo } });
      tipoEquipo = TipoEquipo.COMPUTADORA;
    } else if (dto.codigoEquipo.startsWith('I-')) {
      impresora = await this.impresoraRepo.findOne({ where: { codigo: dto.codigoEquipo } });
      tipoEquipo = TipoEquipo.IMPRESORA;
    } else {
      throw new BadRequestException('Código de equipo inválido, debe comenzar con "C-" o "I-"');
    }
    if (!computadora && !impresora) {
      throw new NotFoundException(`Equipo con código ${dto.codigoEquipo} no encontrado`);
    }

    // 2. Verificar si ya existe una reparación en curso para este equipo
    const existente = await this.reparacionRepo.findOne({
      where: [
        { codigoComputadora: dto.codigoEquipo, estado: In(['registrada', 'en_reparacion']) },
        { codigoImpresora: dto.codigoEquipo, estado: In(['registrada', 'en_reparacion']) }
      ]
    });

    if (existente) {
      throw new BadRequestException(`El equipo ${dto.codigoEquipo} ya está en reparación (falla #${existente.id})`);
    }

    // Convertir fecha de texto "dd/MM/yyyy" a Date
    const fechaParts = dto.fechaRegistro.split('/');
    if (fechaParts.length !== 3) {
      throw new BadRequestException('Formato de fecha incorrecto, debe ser dd/MM/yyyy');
    }
    const fechaRegistro = new Date(+fechaParts[2], +fechaParts[1] - 1, +fechaParts[0]);

    // Crear la nueva reparación (falla)
    const reparacion = this.reparacionRepo.create({
      tipoEvento: dto.tipoEvento,
      tipoEquipo,
      descripcionProblema: dto.descripcionProblema,
      fechaRegistro,
      computadora: tipoEquipo === TipoEquipo.COMPUTADORA ? computadora : null,
      impresora: tipoEquipo === TipoEquipo.IMPRESORA ? impresora : null
    });

    return this.reparacionRepo.save(reparacion);
  }

  async registrarReparacion(dto: CrearReparacionDto) {
    // 1) Validar formato de código y existencia del equipo
    const esComputadora = dto.codigoEquipo.startsWith('C-');
    const esImpresora = dto.codigoEquipo.startsWith('I-');
    if (!esComputadora && !esImpresora) {
      throw new BadRequestException('Código inválido: debe comenzar con "C-" o "I-".');
    }

    if (esComputadora) {
      const compu = await this.computadoraRepo.findOne({ where: { codigo: dto.codigoEquipo } });
      if (!compu) throw new NotFoundException(`Computadora ${dto.codigoEquipo} no encontrada`);
    } else {
      const imp = await this.impresoraRepo.findOne({ where: { codigo: dto.codigoEquipo } });
      if (!imp) throw new NotFoundException(`Impresora ${dto.codigoEquipo} no encontrada`);
    }

    // 2) Buscar la falla ABIERTA para ese código
    const falla = await this.reparacionRepo.findOne({
      where: [
        { codigoComputadora: dto.codigoEquipo, estado: In([EstadoReparacion.REGISTRADA, EstadoReparacion.EN_REPARACION]) },
        { codigoImpresora: dto.codigoEquipo, estado: In([EstadoReparacion.REGISTRADA, EstadoReparacion.EN_REPARACION]) }
      ],
      order: { fechaRegistro: 'DESC' }
    });

    if (!falla) {
      // No hay abierta → revisar si la última está COMPLETADA para dar un mensaje claro
      const ultima = await this.reparacionRepo.findOne({
        where: [{ codigoComputadora: dto.codigoEquipo }, { codigoImpresora: dto.codigoEquipo }],
        order: { fechaRegistro: 'DESC' }
      });

      if (ultima?.estado === EstadoReparacion.COMPLETADA) {
        throw new BadRequestException(`El equipo ${dto.codigoEquipo} ya fue reparado (falla #${ultima.id}).`);
      }

      throw new NotFoundException(`No existe una falla abierta para el equipo ${dto.codigoEquipo}.`);
    }

    // 3) Actualizar datos técnicos y pasar a EN_REPARACION (si estaba REGISTRADA)
    const fechaReparacion = this.parseFecha(dto.fechaReparacion);

    falla.fechaReparacion = fechaReparacion;
    falla.diagnostico = dto.diagnostico;
    falla.accionesRealizadas = dto.accionesRealizadas;
    if (dto.tecnico) falla.tecnico = dto.tecnico;
    if (falla.estado === EstadoReparacion.EN_REPARACION) {
      falla.estado = EstadoReparacion.COMPLETADA;
    }

    // Si querés cerrar acá mismo según un flag:
    // if (dto.cerrar) {
    //   falla.estado = EstadoReparacion.COMPLETADA;
    //   falla.fechaSolucion = new Date();
    // }

    return this.reparacionRepo.save(falla);
  }

  /** Cerrar/completar reparación por id (opcional) */
  /*  async cerrarReparacion(id: number, dto: CerrarReparacionDto) {
    const rep = await this.reparacionRepo.findOne({ where: { id } });
    if (!rep) throw new NotFoundException('Reparación no encontrada');

    rep.fechaSolucion = dto.fechaSolucion ? this.parseFecha(dto.fechaSolucion) : new Date();
    if (dto.tecnico) rep.tecnico = dto.tecnico;
    if (dto.diagnostico) rep.diagnostico = dto.diagnostico;
    if (dto.accionesRealizadas) rep.accionesRealizadas = dto.accionesRealizadas;
    rep.estado = EstadoReparacion.COMPLETADA;

    return this.reparacionRepo.save(rep);
  }
 */
  /** Utilidad: "dd/MM/yyyy" → Date */
  private parseFecha(value: string): Date {
    const parts = value.trim().split('/');
    if (parts.length < 3) {
      throw new BadRequestException('Fecha inválida. Formato esperado: dd/MM/yyyy');
    }
    const [dd, mm, yyyy] = parts;
    const d = Number(dd),
      m = Number(mm),
      y = Number(yyyy);
    if (!d || !m || !y) {
      throw new BadRequestException('Fecha inválida. Formato esperado: dd/MM/yyyy');
    }
    return new Date(y, m - 1, d);
  }
}
