import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reuniones } from '../../../entities/Reuniones';

@Injectable()
export class ReunionesService {
  constructor(
    @InjectRepository(Reuniones)
    private readonly reunionesRepository: Repository<Reuniones>,
  ) {}

  /**
   * Obtiene las reuniones filtradas por el tipo (Review, Retro, Daily) 
   * y carga las relaciones necesarias.
   */
  async findByProyecto(proId: number, tipoReunionId: number): Promise<Reuniones[]> {
    return await this.reunionesRepository
      .createQueryBuilder('reunion')
      // Cargamos el Sprint para mostrar su nombre
      .innerJoinAndSelect('reunion.sprIdFk2', 'sprint')
      // Cargamos el tipo de parámetro para metadatos si es necesario
      .leftJoinAndSelect('reunion.detParIdTipoFk2', 'tipo')
      // Filtramos por el ID del tipo de reunión enviado desde el frontend
      .where('reunion.detParIdTipoFk = :tipoId', { tipoId: tipoReunionId })
      // Si el proyecto está vinculado al sprint, podrías descomentar esto:
      // .andWhere('sprint.proIdFk = :proId', { proId }) 
      .orderBy('reunion.reuFecha', 'DESC')
      .addOrderBy('reunion.reuHora', 'DESC')
      .getMany();
  }

  /**
   * Obtener una reunión específica por ID
   */
  async findOne(id: number): Promise<Reuniones> {
    const reunion = await this.reunionesRepository.findOne({
      where: { reuId: id },
      relations: ['sprIdFk2', 'detParIdTipoFk2']
    });

    if (!reunion) {
      throw new NotFoundException(`La reunión con ID ${id} no existe.`);
    }

    return reunion;
  }

  /**
   * Crear una nueva acta de reunión
   */
  async create(data: Partial<Reuniones>): Promise<Reuniones> {
    const nuevaReunion = this.reunionesRepository.create(data);
    return await this.reunionesRepository.save(nuevaReunion);
  }
}