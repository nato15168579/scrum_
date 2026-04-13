import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observaciones } from '../../../entities/Observaciones';

@Injectable()
export class SugerenciaService {
  constructor(
    @InjectRepository(Observaciones)
    private readonly observacionRepo: Repository<Observaciones>,
  ) {}

  async crearSugerencia(data: { 
    projectId: number; 
    cedula: number; 
    titulo: string; 
    descripcion: string 
  }) {
    try {
      // Creamos una nueva instancia de la entidad
      const nuevaObservacion = new Observaciones();

      // Asignamos los valores a las propiedades que existen en la entidad
      nuevaObservacion.proIdFk = Number(data.projectId);
      nuevaObservacion.usuCedulaFk = Number(data.cedula);
      nuevaObservacion.obsDescripcion = `${data.titulo}: ${data.descripcion}`;
      
      // Fecha en formato YYYY-MM-DD
      nuevaObservacion.obsFecha = new Date().toISOString().split('T')[0];
      
      /** * CORRECCIÓN: 
       * Cambiamos 'obsEstadoFk' por 'detParIdFk' que es el nombre real en la entidad.
       * El ID 13 suele representar 'Por hacer' o estado inicial en tu tabla detalle_parametro.
       */
      nuevaObservacion.detParIdFk = 13; 

      // Guardamos la instancia
      const guardado = await this.observacionRepo.save(nuevaObservacion);

      return {
        success: true,
        data: guardado,
        message: 'Sugerencia guardada correctamente',
      };
    } catch (error) {
      console.error('Error detallado al crear observación:', error);
      throw new InternalServerErrorException('Error al guardar en la base de datos');
    }
  }
}