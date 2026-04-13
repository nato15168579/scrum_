import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CriteriosAceptacion } from '../../../../entities/CriteriosAceptacion';

@Injectable()
export class CriterioService {
  constructor(
    @InjectRepository(CriteriosAceptacion)
    private criterioRepo: Repository<CriteriosAceptacion>,
  ) {}

  async findByProyectoAndHistoria(proId: number, hisId: number): Promise<CriteriosAceptacion[]> {
    return await this.criterioRepo.find({
      where: { 
        proIdFk: proId, 
        hisIdFk: hisId 
      },
      order: { criId: 'ASC' },
      // CORRECCIÓN: Ajustamos los nombres de las relaciones según la entidad
      // 'usuCedulaFk2' (Usuario) y 'detParIdFk2' (Estado/Parámetro)
      relations: ['usuCedulaFk2', 'detParIdFk2'] 
    });
  }
}