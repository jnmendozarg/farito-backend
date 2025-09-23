import { Reparacion } from 'src/reparaciones/entities/reparacion.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'computadora' })
export class Computadora {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 10, name: 'codigo', unique: true, nullable: false })
  codigo: string;

  @Column({ type: 'varchar', length: 100, name: 'marca' })
  marca: string;

  @Column({ type: 'varchar', length: 100, name: 'procesador' })
  procesador: string;

  @Column({ type: 'datetime', name: 'fecha_ingreso', nullable: true })
  fecha: Date;

  @Column({ type: 'varchar', length: 100, name: 'tipo_almacenemiento', nullable: true })
  tipoAlmacenamiento: string;

  @Column({ type: 'varchar', length: 100, name: 'ram', nullable: true })
  ram: string;

  @Column({ type: 'varchar', length: 100, name: 'sistema_operativo', nullable: true })
  sistemaOperativo: string;

  @Column({ type: 'enum', enum: ['usado', 'nuevo'], name: 'condicion', default: 'nuevo' })
  condicion: 'usado' | 'nuevo';

  @OneToMany(() => Reparacion, (reparacion) => reparacion.computadora)
  reparaciones: Reparacion[];
}
