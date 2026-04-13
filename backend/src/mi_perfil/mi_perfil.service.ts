import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario';

@Injectable()
export class MiPerfilService { // <--- DEBE DECIR 'export'
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async obtenerPerfil(cedula: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { usuCedula: cedula },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const { usuContrasena, ...perfil } = usuario;
    return perfil;
  }
}