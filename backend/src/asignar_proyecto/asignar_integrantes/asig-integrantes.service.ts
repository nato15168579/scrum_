import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Usuario } from '../../entities/Usuario';
import { UsuProDetPar } from '../../entities/UsuProDetPar';

@Injectable()
export class AsigIntegrantesService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuProDetPar) private readonly usuProDetParRepo: Repository<UsuProDetPar>,
    private dataSource: DataSource,
  ) {}

  async getAprendices() {
    return await this.usuarioRepo.find({
      where: { rolSisIdFk: 1 },
      select: ['usuCedula', 'usuNombres', 'usuApellidos'],
    });
  }

  async getIntegrantesPorProyecto(proId: number) {
    // Buscamos usando el nombre de la columna en la entidad que mapea a 'pro_ID'
    return await this.usuProDetParRepo.find({
      where: { proId: proId }, 
      relations: ['usuCedula2'],
    });
  }

  async guardarAsignacion(proId: number, assignments: { cedula: number; rolId: number }[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Limpiar equipo previo usando el nombre real de la columna: pro_ID
      await queryRunner.manager.query(
        "DELETE FROM `usu_pro_det_par` WHERE `pro_ID` = ?",
        [proId]
      );

      // 2. Insertar nuevos integrantes
      for (const item of assignments) {
        let roleMapped = 6; // Team Member por defecto
        if (item.rolId === 1) roleMapped = 4; // Product Owner
        else if (item.rolId === 2) roleMapped = 5; // Scrum Master

        // Nombres de columnas según tu SQL: usu_cedula, det_par_ID_FK, pro_ID
        await queryRunner.manager.query(
          "INSERT INTO `usu_pro_det_par` (`usu_cedula`, `pro_ID`, `det_par_ID_FK`) VALUES (?, ?, ?)",
          [item.cedula, proId, roleMapped]
        );
      }

      await queryRunner.commitTransaction();
      return { status: 'success' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error SQL:", error.message);
      throw new InternalServerErrorException("Error en la base de datos: " + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}