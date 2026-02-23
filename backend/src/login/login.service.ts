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
    console.log('🔍 [LoginService] Buscando usuario con cédula:', cedula);
    
    // 1. Buscar usuario por cédula
    const usuario = await this.usuarioRepo.findOne({ 
      where: { usuCedula: Number(cedula) } 
    });

    if (!usuario) {
      console.error('❌ [LoginService] Usuario no encontrado con cédula:', cedula);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    console.log('✅ [LoginService] Usuario encontrado:', {
      usuCedula: usuario.usuCedula,
      usuNombres: usuario.usuNombres,
      rolSisIdFk: usuario.rolSisIdFk,
    });

    // 2. Validar contraseña con bcrypt
    const esValida = await bcrypt.compare(pass, usuario.usuContrasena!);

    if (!esValida) {
      console.error('❌ [LoginService] Contraseña incorrecta para cédula:', cedula);
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    console.log('✅ [LoginService] Contraseña válida');

    // 3. Devolver datos sin la contraseña
    const { usuContrasena, ...datos } = usuario;
    
    console.log('📤 [LoginService] Devolviendo datos del usuario:', {
      usuCedula: datos.usuCedula,
      usuNombres: datos.usuNombres,
      rolSisIdFk: datos.rolSisIdFk,
    });
    
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