import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Impresora } from './entities/impresora.entity';
import { Computadora } from './entities/computadora';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateComputadoraDto } from './dto/create-equipo.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Impresora)
    private readonly impresoraRepository: Repository<Impresora>,

    @InjectRepository(Computadora)
    private readonly computadoraRepository: Repository<Computadora>
  ) {}

  async crearImpresora(data: Partial<Impresora>): Promise<Impresora> {
    const nuevaImpresora = this.impresoraRepository.create(data);
    const impresoraGuardada = await this.impresoraRepository.save(nuevaImpresora);

    const codigoGenerado = `I-${String(impresoraGuardada.id).padStart(3, '0')}`;
    await this.impresoraRepository.update(impresoraGuardada.id, {
      codigo: codigoGenerado
    });

    const impresoraConCodigo = await this.impresoraRepository.findOneBy({
      id: impresoraGuardada.id
    });

    if (!impresoraConCodigo) {
      throw new Error('No se pudo encontrar la impresora luego de actualizar el código.');
    }

    return impresoraConCodigo;
  }
  async crearComputadora(data: Partial<Computadora>) {
    const nuevaComputadora = this.computadoraRepository.create(data);
    const computadoraGuardada = await this.computadoraRepository.save(nuevaComputadora);

    const codigoGenerado = `C-${String(computadoraGuardada.id).padStart(3, '0')}`;
    await this.computadoraRepository.update(computadoraGuardada.id, {
      codigo: codigoGenerado
    });

    const computadoraConCodigo = await this.computadoraRepository.findOneBy({
      id: computadoraGuardada.id
    });

    return computadoraConCodigo;
  }
}
