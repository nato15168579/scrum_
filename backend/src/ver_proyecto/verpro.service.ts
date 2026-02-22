// src/ver_proyecto/verpro.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../entities/Proyecto';

@Injectable()
export class VerproService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
  ) {}

  async findAll() {
    return await this.proyectoRepository.find({
      // IMPORTANTE: Usa los nombres de las variables en tu Entity Proyecto
      relations: [
        'historiaUsuarios', 
        'detParIdFk2', 
        'sprints'
      ],
    });
  }

  async findOne(id: number) {
    const proyecto = await this.proyectoRepository.findOne({
      where: { proId: id }, // Usando proId como definimos en la Entity
      relations: ['historiaUsuarios', 'detParIdFk2'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    return proyecto;
  }
}