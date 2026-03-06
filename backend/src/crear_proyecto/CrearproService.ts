import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../entities/Proyecto';
import { UsuProDetPar } from '../entities/UsuProDetPar';

@Injectable()
export class CrearproService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(UsuProDetPar)
    private readonly usuRepository: Repository<UsuProDetPar>,
  ) {}

  private getProjectTableName() {
    return this.proyectoRepository.metadata.tableName;
  }

  private getEscapedProjectTableName() {
    return `\`${this.getProjectTableName().replace(/`/g, '``')}\``;
  }

  private async projectCodeColumnExists() {
    const proyectoTableName = this.getProjectTableName();
    const result = await this.proyectoRepository.query(
      `
      SELECT 1 AS ok
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = 'pro_codigo'
      LIMIT 1
    `,
      [proyectoTableName],
    );

    return Array.isArray(result) && result.length > 0;
  }

  private async ensureProjectCodeSchema() {
    const hasProjectCodeColumn = await this.projectCodeColumnExists();
    const escapedTableName = this.getEscapedProjectTableName();

    if (!hasProjectCodeColumn) {
      await this.proyectoRepository.query(
        `
        ALTER TABLE ${escapedTableName}
        ADD COLUMN pro_codigo VARCHAR(32) NULL COMMENT 'codigo unico del proyecto' AFTER pro_ID
      `,
      );
    }

    await this.proyectoRepository.query(
      `
      UPDATE ${escapedTableName}
      SET pro_codigo = CONCAT('PRO-', LPAD(pro_ID, 6, '0'))
      WHERE pro_codigo IS NULL OR pro_codigo = ''
    `,
    );

    const uniqueIndexExistsResult = await this.proyectoRepository.query(
      `
      SELECT 1 AS ok
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = 'uq_proyecto_codigo'
      LIMIT 1
    `,
      [this.getProjectTableName()],
    );
    const uniqueIndexExists =
      Array.isArray(uniqueIndexExistsResult) &&
      uniqueIndexExistsResult.length > 0;

    if (!uniqueIndexExists) {
      await this.proyectoRepository.query(
        `
        ALTER TABLE ${escapedTableName}
        ADD CONSTRAINT uq_proyecto_codigo UNIQUE (pro_codigo)
      `,
      );
    }

    return true;
  }

  private async generateUniqueProjectCode(projectId: number) {
    const baseCode = `PRO-${String(projectId).padStart(6, '0')}`;
    let candidate = baseCode;
    let suffix = 1;

    while (
      await this.proyectoRepository.findOne({
        where: { proCodigo: candidate },
      })
    ) {
      candidate = `${baseCode}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  async checkProjectExists(nombre: string) {
    const proyecto = await this.proyectoRepository.findOne({ where: { proNombre: nombre } });
    return { exists: !!proyecto };
  }

  async createProject(data: {
    nombre: string;
    objetivo: string;
    fecha: string;
    fechaInicio?: string;
    fechaFin?: string;
    cedula: number;
  }) {
    
    // 1. Validar nombre
    const existe = await this.proyectoRepository.findOne({ where: { proNombre: data.nombre } });
    if (existe) throw new ConflictException('El nombre del proyecto ya está registrado');

    try {
      // 2. GENERAR ID MANUAL
      // Buscamos el ID más alto actual
      const ultimo = await this.proyectoRepository.findOne({
        where: {},
        order: { proId: 'DESC' }
      });
      const nuevoId = ultimo ? ultimo.proId + 1 : 1;
      const hasProjectCodeColumn = await this.ensureProjectCodeSchema();
      const codigoProyecto = hasProjectCodeColumn
        ? await this.generateUniqueProjectCode(nuevoId)
        : null;
      const fechaInicioNormalizada =
        typeof data.fechaInicio === 'string'
          ? (data.fechaInicio.trim() || null)
          : data.fecha;
      const fechaFinNormalizada =
        typeof data.fechaFin === 'string'
          ? (data.fechaFin.trim() || null)
          : data.fecha;

      // 3. BUSCAR ID DE PARÁMETRO (O usar uno por defecto que sepas que existe)
      const relacion = await this.usuRepository.findOne({
        where: { detParId: data.cedula } // Ajustado según tu error TS anterior
      });
      const idParametroValido = relacion ? relacion.detParId : 1; // '1' debe existir en tu DB

      // 4. CREAR INSTANCIA
      const nuevoProyecto = this.proyectoRepository.create({
        proId: nuevoId, // Asignamos el ID calculado
        proNombre: data.nombre,
        proObjetivoGeneral: data.objetivo,
        proFechaInicio: fechaInicioNormalizada,
        detParIdFk: idParametroValido,
        proDescription: data.objetivo,
        proJustificacion: "N/A",
        proObjetivosEspecificos: "N/A",
        proFechaFin: fechaFinNormalizada,
      });

      if (hasProjectCodeColumn && codigoProyecto) {
        nuevoProyecto.proCodigo = codigoProyecto;
      }

      // 5. GUARDAR
      return await this.proyectoRepository.save(nuevoProyecto);

    } catch (error) {
      console.error("ERROR CRÍTICO:", error);
      throw new InternalServerErrorException('No se pudo completar el registro en la base de datos.');
    }
  }
}
