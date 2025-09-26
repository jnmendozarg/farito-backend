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

  async encontrarAbiertaPorCodigo(codigo: string) {
    if (!codigo?.trim()) return null;

    const abierta = await this.reparacionRepo.findOne({
      where: [
        { codigoComputadora: codigo, estado: In([EstadoReparacion.REGISTRADA, EstadoReparacion.EN_REPARACION]) },
        { codigoImpresora: codigo, estado: In([EstadoReparacion.REGISTRADA, EstadoReparacion.EN_REPARACION]) }
      ],
      order: { fechaRegistro: 'DESC' }
    });

    return abierta; // puede ser null
  }

  /** Historial por código de equipo (C-### o I-###) */
  async historialPorCodigo2(codigo: string) {
    const cod = (codigo ?? '').trim();
    if (!cod) {
      throw new BadRequestException('codigo es requerido');
    }

    const esComputadora = cod.startsWith('C-');
    const esImpresora = cod.startsWith('I-');
    if (!esComputadora && !esImpresora) {
      throw new BadRequestException('Código inválido: debe comenzar con "C-" o "I-".');
    }

    // Verificar existencia del equipo
    if (esComputadora) {
      const comp = await this.computadoraRepo.findOne({ where: { codigo: cod } });
      if (!comp) throw new NotFoundException(`Computadora ${cod} no encontrada`);
    } else {
      const imp = await this.impresoraRepo.findOne({ where: { codigo: cod } });
      if (!imp) throw new NotFoundException(`Impresora ${cod} no encontrada`);
    }

    // Traer historial ordenado por fechaRegistro DESC
    const reparaciones = await this.reparacionRepo.find({
      where: [{ codigoComputadora: cod }, { codigoImpresora: cod }],
      order: { fechaRegistro: 'DESC' }
      // relations: ['computadora', 'impresora'], // opcional si querés más info del equipo
    });

    if (!reparaciones.length) {
      // Si prefieres 200 con lista vacía, cambia por: return { codigo: cod, total: 0, items: [] };
      throw new NotFoundException(`No hay reparaciones para el equipo ${cod}.`);
    }

    // Mapear salida con fechas formateadas
    const items = reparaciones.map((r) => ({
      id: r.id,
      tipoEvento: r.tipoEvento,
      tipoEquipo: r.tipoEquipo, // 'computadora' | 'impresora'
      descripcionProblema: r.descripcionProblema,
      estado: r.estado, // registrada | en_reparacion | completada | cancelada
      fechaRegistro: this.toDDMMYYYY(r.fechaRegistro),
      fechaReparacion: this.toDDMMYYYY(r.fechaReparacion),
      fechaSolucion: this.toDDMMYYYY(r.fechaReparacion),
      diagnostico: r.diagnostico ?? null,
      accionesRealizadas: r.accionesRealizadas ?? null,
      tecnico: r.tecnico ?? null
    }));

    return {
      codigo: cod,
      total: items.length,
      items
    };
  }

  /** Utilidad: Date -> "dd/MM/yyyy" (o null si no hay fecha) */
  private toDDMMYYYY(date?: Date | null): string | null {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  /** Historial + datos del equipo por código (C-### o I-###) */
  async historialPorCodigo(codigo: string) {
    const cod = (codigo ?? '').trim();
    if (!cod) throw new BadRequestException('codigo es requerido');

    const esComputadora = cod.startsWith('C-');
    const esImpresora = cod.startsWith('I-');
    if (!esComputadora && !esImpresora) {
      throw new BadRequestException('Código inválido: debe comenzar con "C-" o "I-".');
    }

    let equipo: any = null;

    if (esComputadora) {
      const comp = await this.computadoraRepo.findOne({ where: { codigo: cod } });
      if (!comp) throw new NotFoundException(`Computadora ${cod} no encontrada`);

      equipo = {
        tipo: 'computadora',
        codigo: comp.codigo,
        marca: comp.marca,
        procesador: comp.procesador,
        tipoAlmacenamiento: comp.tipoAlmacenamiento,
        ram: comp.ram,
        sistemaOperativo: comp.sistemaOperativo
      };
    } else {
      const imp = await this.impresoraRepo.findOne({ where: { codigo: cod } });
      if (!imp) throw new NotFoundException(`Impresora ${cod} no encontrada`);

      equipo = {
        tipo: 'impresora',
        codigo: imp.codigo,
        modelo: imp.modelo,
        tipoImpresora: imp.tipo, // Laser | Inyeccion | ...
        conectividad: imp.conectividad,
        compatibilidad: imp.compatibilidad,
        software_o_driver: imp.software_o_driver,
        departamento: imp.departamento ?? null
      };
    }

    const reparaciones = await this.reparacionRepo.find({
      where: [{ codigoComputadora: cod }, { codigoImpresora: cod }],
      order: { fechaRegistro: 'DESC' }
    });

    const items = reparaciones.map((r) => ({
      codigoReparacion: `R-${String(r.id).padStart(3, '0')}`,
      id: r.id, // sigo enviando el id por si lo necesitás
      tipoEvento: r.tipoEvento,
      tipoEquipo: r.tipoEquipo,
      descripcionProblema: r.descripcionProblema,
      estado: r.estado,
      fechaRegistro: this.toDDMMYYYY(r.fechaRegistro),
      fechaReparacion: this.toDDMMYYYY(r.fechaReparacion),
      fechaSolucion: this.toDDMMYYYY(r.fechaReparacion),
      diagnostico: r.diagnostico ?? null,
      accionesRealizadas: r.accionesRealizadas ?? null,
      tecnico: r.tecnico ?? null
    }));

    return {
      codigo: cod,
      equipo, // ← agregado
      total: items.length,
      items
    };
  }
}
