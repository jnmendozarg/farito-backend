import { Computadora } from 'src/equipos/entities/computadora';
import { Impresora } from 'src/equipos/entities/impresora.entity';
import { text } from 'stream/consumers';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum TipoEquipo {
  COMPUTADORA = 'computadora',
  IMPRESORA = 'impresora'
}

export enum EstadoReparacion {
  REGISTRADA = 'registrada',
  EN_REPARACION = 'en_reparacion',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada'
}

@Entity({ name: 'falla_reparacion' })
export class Reparacion {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'text', name: 'tipo_evento' })
  tipoEvento: string;

  @Column({ type: 'enum', enum: EstadoReparacion, name: 'estado', default: EstadoReparacion.EN_REPARACION })
  estado: EstadoReparacion;

  @Column({ type: 'enum', enum: TipoEquipo, name: 'tipo_equipo' })
  tipoEquipo: TipoEquipo;

  @Column({ type: 'text', name: 'descripcion_problema' })
  descripcionProblema: string;

  @Column({ type: 'datetime', name: 'fecha_registro' })
  fechaRegistro: Date;

  @Column({ type: 'datetime', name: 'fecha_reparacion', nullable: true })
  fechaReparacion: Date | null;

  @Column({ type: 'text', name: 'diagnostico', nullable: true })
  diagnostico?: string | null;

  @Column({ type: 'text', name: 'acciones_realizadas', nullable: true })
  accionesRealizadas?: string | null;

  @Column({ type: 'varchar', length: 100, name: 'tecnico', nullable: true })
  tecnico: string | null;

  /** FK por código a Computadora.codigo (opcional) */
  @ManyToOne(() => Computadora, (computadora) => computadora.reparaciones, { nullable: true })
  @JoinColumn({ name: 'codigo_computadora', referencedColumnName: 'codigo' })
  computadora: Computadora | null;

  /** FK por código a Impresora.codigo (opcional) */
  @ManyToOne(() => Impresora, (impresora) => impresora.reparaciones, { nullable: true })
  @JoinColumn({ name: 'codigo_impresora', referencedColumnName: 'codigo' })
  impresora: Impresora | null;

  @Column({ type: 'varchar', length: 10, name: 'codigo_computadora', nullable: true })
  codigoComputadora: string | null;

  @Column({ type: 'varchar', length: 10, name: 'codigo_impresora', nullable: true })
  codigoImpresora: string | null;
}
