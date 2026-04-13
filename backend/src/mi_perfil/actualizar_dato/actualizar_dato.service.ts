import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ActualizarDatoService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findOne(cedula: string) {
    // Nombres exactos de tu entidad: usu_tipodedocumento
    const usuario = await this.dataSource.query(
      'SELECT usu_cedula, usu_nombres, usu_apellidos, usu_correo, usu_telefono, usu_tipodedocumento FROM usuario WHERE usu_cedula = ?',
      [cedula]
    );

    if (!usuario || usuario.length === 0) {
      throw new NotFoundException(`Usuario con cédula ${cedula} no encontrado`);
    }

    return usuario[0];
  }

  async update(cedula: string, updateData: any) {
    // Mapeamos los campos que vienen del frontend a los nombres de la base de datos
    const { usu_nombres, usu_apellidos, usu_correo, usu_telefono, usu_tipodedocumento } = updateData;

    const result = await this.dataSource.query(
      `UPDATE usuario 
       SET usu_nombres = ?, 
           usu_apellidos = ?, 
           usu_correo = ?, 
           usu_telefono = ?, 
           usu_tipodedocumento = ? 
       WHERE usu_cedula = ?`,
      [usu_nombres, usu_apellidos, usu_correo, usu_telefono, usu_tipodedocumento, cedula]
    );

    return { message: 'Datos actualizados correctamente' };
  }
}