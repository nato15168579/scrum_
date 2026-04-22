import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/Usuario';
import {
  compareWithStoredPassword,
  hashPassword,
  validatePasswordPolicy,
} from '../../login/PasswordSecurity';

@Injectable()
export class CambiarContrasenaService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async actualizarPassword(
    cedula: number,
    passActual: string,
    passNueva: string,
  ) {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuCedula: cedula },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const coinciden = await compareWithStoredPassword(
      passActual,
      usuario.usuContrasena,
    );

    if (!coinciden) {
      throw new UnauthorizedException('La contrasena actual es incorrecta');
    }

    const passwordValidation = validatePasswordPolicy(passNueva);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(' '));
    }

    const esLaMismaPassword = await compareWithStoredPassword(
      passNueva,
      usuario.usuContrasena,
    );
    if (esLaMismaPassword) {
      throw new BadRequestException(
        'La nueva contrasena debe ser diferente a la actual',
      );
    }

    usuario.usuContrasena = await hashPassword(passNueva);
    await this.usuarioRepository.save(usuario);

    return { message: 'Contrasena actualizada con exito' };
  }
}
