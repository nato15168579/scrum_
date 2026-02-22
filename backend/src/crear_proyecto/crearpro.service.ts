import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../entities/proyecto'; 
import { UsuProDetPar } from '../entities/UsuProDetPar';

@Injectable()
export class CrearproService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(UsuProDetPar)
    private readonly usuRepository: Repository<UsuProDetPar>,
  ) {}

  async checkProjectExists(nombre: string) {
    const proyecto = await this.proyectoRepository.findOne({ where: { proNombre: nombre } });
    return { exists: !!proyecto };
  }

  async createProject(data: { nombre: string; objetivo: string; fecha: string; cedula: number }) {
    
    // 1. Validar nombre
    const existe = await this.proyectoRepository.findOne({ where: { proNombre: data.nombre } });
    if (existe) throw new ConflictException('El nombre del proyecto ya está registrado');

    try {
      // 2. GENERAR ID MANUAL
      // Buscamos el ID más alto actual
      const ultimo = await this.proyectoRepository.findOne({
        where: {},
        order: { proId: 'DESC' }
      });
      const nuevoId = ultimo ? ultimo.proId + 1 : 1;

      // 3. BUSCAR ID DE PARÁMETRO (O usar uno por defecto que sepas que existe)
      const relacion = await this.usuRepository.findOne({
        where: { detParId: data.cedula } // Ajustado según tu error TS anterior
      });
      const idParametroValido = relacion ? relacion.detParId : 1; // '1' debe existir en tu DB

      // 4. CREAR INSTANCIA
      const nuevoProyecto = this.proyectoRepository.create({
        proId: nuevoId, // Asignamos el ID calculado
        proNombre: data.nombre,
        proObjetivoGeneral: data.objetivo,
        proFechaInicio: data.fecha,
        detParIdFk: idParametroValido,
        proDescription: "Registro manual",
        proJustificacion: "N/A",
        porObjetivosEspecificos: "N/A",
        proDuracionSprint: "2 semanas",
        proFechaFin: data.fecha
      });

      // 5. GUARDAR
      return await this.proyectoRepository.save(nuevoProyecto);

    } catch (error) {
      console.error("ERROR CRÍTICO:", error);
      throw new InternalServerErrorException('No se pudo completar el registro en la base de datos.');
    }
  }
}