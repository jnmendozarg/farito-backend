import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  marca: string;

  @Column({ type: 'varchar', length: 100 })
  modelo: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'datetime', name: 'fecha_reparacion', nullable: true })
  fechaReparacion: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'Pendiente' })
  estado: string; // "Pendiente", "Aprobado", "Rechazado"
}
