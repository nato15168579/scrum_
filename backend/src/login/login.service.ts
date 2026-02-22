import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async validarUsuario(cedula: string, pass: string) {
    // 1. Cambiamos 'usu_cedula' por 'usuCedula' (como dice tu entidad)
    const usuario = await this.usuarioRepo.findOne({ 
      where: { usuCedula: Number(cedula) } 
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 2. Cambiamos 'usu_password' por 'usuContraseA' (el nombre raro que generó para la ñ)
    // Usamos '!' porque en tu entidad dice que puede ser null
    const esValida = await bcrypt.compare(pass, usuario.usuContrasena!);

    if (!esValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // 3. Devolvemos los datos (quitando la contraseña con el nombre correcto)
    const { usuContrasena, ...datos } = usuario;
    return datos;
  }

  // MÉTODO FIX CORREGIDO
  async fixPasswords() {
    const usuarios = await this.usuarioRepo.find();
    let contador = 0;
    for (const u of usuarios) {
      // Verificamos si existe la contraseña y no está encriptada
      if (u.usuContrasena && !u.usuContrasena.startsWith('$2b$')) {
        u.usuContrasena = await bcrypt.hash(u.usuContrasena, 10);
        await this.usuarioRepo.save(u);
        contador++;
      }
    }
    return { mensaje: `Se actualizaron ${contador} claves` };
  }
}