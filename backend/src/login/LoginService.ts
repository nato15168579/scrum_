/**
 * LoginService
 * ------------
 * Servicio de autenticacion para validar credenciales de usuario.
 *
 * Comportamiento:
 * - Si la contrasena almacenada ya es bcrypt, compara con bcrypt.
 * - Si la contrasena almacenada esta en texto plano (legacy), valida por igualdad y
 *   migra a bcrypt en el primer login exitoso.
 *
 * Nota:
 * - `fixPasswords()` existe como helper de migracion, pero no debe exponerse sin proteccion.
 */
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
    console.log('[LoginService] Buscando usuario con cedula:', cedula);

    const usuario = await this.usuarioRepo.findOne({
      where: { usuCedula: Number(cedula) },
    });

    if (!usuario) {
      console.error('[LoginService] Usuario no encontrado con cedula:', cedula);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.usuEstado === 'Inactivo') {
      console.error('[LoginService] Usuario inactivo:', cedula);
      throw new UnauthorizedException('Usuario inactivo');
    }

    console.log('[LoginService] Usuario encontrado:', {
      usuCedula: usuario.usuCedula,
      usuNombres: usuario.usuNombres,
      rolSisIdFk: usuario.rolSisIdFk,
    });

    const passwordGuardada = usuario.usuContrasena || '';
    let esValida = false;

    if (passwordGuardada.startsWith('$2')) {
      esValida = await bcrypt.compare(pass, passwordGuardada);
    } else {
      esValida = pass === passwordGuardada;
      if (esValida) {
        usuario.usuContrasena = await bcrypt.hash(pass, 10);
        await this.usuarioRepo.save(usuario);
      }
    }

    if (!esValida) {
      console.error(
        '[LoginService] Contrasena incorrecta para cedula:',
        cedula,
      );
      throw new UnauthorizedException('Contrasena incorrecta');
    }

    console.log('[LoginService] Contrasena valida');

    const datos = { ...usuario };
    delete datos.usuContrasena;

    console.log('[LoginService] Devolviendo datos del usuario:', {
      usuCedula: datos.usuCedula,
      usuNombres: datos.usuNombres,
      rolSisIdFk: datos.rolSisIdFk,
    });

    return datos;
  }

  async fixPasswords() {
    const usuarios = await this.usuarioRepo.find();
    let contador = 0;

    for (const u of usuarios) {
      if (u.usuContrasena && !u.usuContrasena.startsWith('$2b$')) {
        u.usuContrasena = await bcrypt.hash(u.usuContrasena, 10);
        await this.usuarioRepo.save(u);
        contador++;
      }
    }

    return { mensaje: `Se actualizaron ${contador} claves` };
  }
}
