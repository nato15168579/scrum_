import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/Usuario';
import * as bcrypt from 'bcrypt'; // <--- IMPORTANTE: Importar bcrypt

@Injectable()
export class CambiarContrasenaService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async actualizarPassword(cedula: number, passActual: string, passNueva: string) {
    const usuario = await this.usuarioRepository.findOne({ 
      where: { usuCedula: cedula } 
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // El valor de la BD es un hash de Bcrypt
    const hashEnBD = usuario.usuContrasena || "";

    // COMPARACIÓN CORRECTA PARA BCRYPT
    const coinciden = await bcrypt.compare(passActual, hashEnBD);

    if (!coinciden) {
      console.log('--- ERROR: La clave no coincide con el hash ---');
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // ANTES DE GUARDAR LA NUEVA: También debemos encriptarla
    // para que el usuario pueda volver a loguearse después.
    const salt = await bcrypt.genSalt(10);
    const nuevaHashed = await bcrypt.hash(passNueva, salt);

    usuario.usuContrasena = nuevaHashed;
    
    await this.usuarioRepository.save(usuario);
    
    return { message: 'Contraseña actualizada con éxito' };
  }
}