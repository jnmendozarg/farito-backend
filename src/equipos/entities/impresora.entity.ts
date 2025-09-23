import { Reparacion } from 'src/reparaciones/entities/reparacion.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum TipoImpresora {
  LASER = 'Laser',
  INYECCION = 'Inyeccion',
  TERMICA = 'Termica',
  MATRICIAL = 'Matricial',
  CONTINUA = 'Continua',
  OTRO = 'Otro'
}

@Entity({ name: 'impresoras' })
export class Impresora {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 10, name: 'codigo', unique: true, nullable: false })
  codigo: string;

  @Column({ type: 'varchar', length: 100, name: 'modelo' })
  modelo: string;

  @Column({ type: 'enum', enum: TipoImpresora, name: 'tipo' })
  tipo: TipoImpresora;

  @Column({ type: 'varchar', length: 100, name: 'departamento', nullable: true })
  departamento: string;

  @Column({ type: 'varchar', length: 100, name: 'software_o_driver' })
  software_o_driver: string;

  @Column({ type: 'varchar', length: 100, name: 'compatibilidad' })
  compatibilidad: string;

  @Column({ type: 'varchar', length: 100, name: 'conectividad' })
  conectividad: string;

  @OneToMany(() => Reparacion, (reparacion) => reparacion.impresora)
  reparaciones: Reparacion[];
}
