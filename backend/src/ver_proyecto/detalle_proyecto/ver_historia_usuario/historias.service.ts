import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriaUsuario } from '../../../entities/HistoriaUsuario';

@Injectable()
export class HistoriasService {
  constructor(
    @InjectRepository(HistoriaUsuario)
    private readonly historiaRepository: Repository<HistoriaUsuario>,
  ) {}

  // Busca solo las historias que pertenecen a ESTE proyecto
  async findByProyecto(proId: number): Promise<HistoriaUsuario[]> {
    return await this.historiaRepository.find({
      where: { proIdFk: proId }, // Filtro por ID de Proyecto
      relations: ['criteriosAceptacions', 'detParIdFk2'],
      order: { hisId: 'ASC' },
    });
  }

  // Busca una historia específica dentro de un proyecto específico
  async findOne(hisId: number, proId: number): Promise<HistoriaUsuario> {
    const historia = await this.historiaRepository.findOne({
      where: { 
        hisId: hisId, 
        proIdFk: proId // Validación de pertenencia
      },
      relations: ['criteriosAceptacions', 'detParIdFk2'],
    });

    if (!historia) {
      throw new NotFoundException(`La HU-${hisId} no existe en el proyecto ${proId}`);
    }
    return historia;
  }
}