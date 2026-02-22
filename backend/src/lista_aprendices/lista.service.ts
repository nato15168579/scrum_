import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario'; // Asegúrate de que la ruta sea correcta

@Injectable()
export class ListaService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAllAprendices() {
    // Buscamos usuarios con rolSisIdFk = 1 (Aprendices)
    const aprendices = await this.usuarioRepository.find({
      where: {
        rolSisIdFk: 1, 
      },
      select: [
        'usuCedula',
        'usuFicha',
        'usuNombres',
        'usuApellidos',
        'usuTelefono',
        'usuCorreo',
      ],
    });

    // Mapeamos los nombres de la BD a los nombres que espera tu Frontend
    return aprendices.map(ap => ({
      documento: ap.usuCedula.toString(),
      ficha: ap.usuFicha || 'Sin ficha',
      nombre: ap.usuNombres,
      apellido: ap.usuApellidos,
      telefono: ap.usuTelefono,
      email: ap.usuCorreo,
    }));
  }

  async getInstructorStats(cedula: string) {
    const instructor = await this.usuarioRepository.findOne({
      where: { usuCedula: parseInt(cedula) },
      select: ['usuNombres', 'usuApellidos'],
    });

    return {
      instructor: instructor 
        ? `${instructor.usuNombres} ${instructor.usuApellidos}` 
        : 'Instructor SENA',
    };
  }
}