import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { Reuniones } from "../entities/Reuniones";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Sprint } from "../entities/Sprint";
import { Usuario } from "../entities/Usuario";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { CreateReunionDto } from "./dto/create-reunion.dto";
import { UpdateReunionInformeDto } from "./dto/update-reunion-informe.dto";

type AsistenteDetalle = {
  cedula: string;
  nombre: string;
};

@Injectable()
export class AprendizReunionesService {
  constructor(
    @InjectRepository(Reuniones)
    private readonly reunionesRepo: Repository<Reuniones>,

    @InjectRepository(UsuProDetPar)
    private readonly usuProDetParRepo: Repository<UsuProDetPar>,

    @InjectRepository(Sprint)
    private readonly sprintRepo: Repository<Sprint>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(HistoriaUsuario)
    private readonly historiaRepo: Repository<HistoriaUsuario>
  ) {}

  async findByAprendizCedula(cedula: number | string) {
    if (!cedula) {
      throw new BadRequestException("La cédula es obligatoria.");
    }

    const relaciones = await this.usuProDetParRepo.find({
      where: { usuCedula: Number(cedula) } as any,
    });

    if (!relaciones.length) {
      return [];
    }

    const projectIds = [
      ...new Set(relaciones.map((r: any) => Number(r.proId)).filter(Boolean)),
    ];

    const historias = await this.historiaRepo.find({
      where: {
        proIdFk: In(projectIds),
      } as any,
      select: {
        sprintIdFk: true,
      } as any,
    });

    const sprintIds = [
      ...new Set(
        historias
          .map((h: any) => Number(h.sprintIdFk))
          .filter((id) => Number.isFinite(id) && id > 0)
      ),
    ];

    if (!sprintIds.length) {
      return [];
    }

    const reuniones = await this.reunionesRepo.find({
      where: {
        sprIdFk: In(sprintIds),
      } as any,
      relations: {
        detParIdTipoFk2: true,
        detParIdEstadoFk2: true,
        reuResponsableFk2: true,
      } as any,
      order: {
        reuFecha: "DESC",
        reuHora: "DESC",
        reuId: "DESC",
      } as any,
    });

    const asistentesPorReunion = await this.getAsistentesPorReunion(
      reuniones,
      projectIds
    );

    return reuniones.map((reu) => {
      const esResponsable =
        String(reu.reuResponsableFk ?? "") === String(cedula);

      const asistentesDetalle =
        asistentesPorReunion.get(Number(reu.reuId)) ?? [];

      return {
        id: reu.reuId,
        tipo: this.getDetalleLabel(reu.detParIdTipoFk2),
        fecha: reu.reuFecha ?? null,
        descripcion: reu.reuDescripcion ?? null,
        hora: reu.reuHora ?? null,
        responsable: this.getNombreCompleto(reu.reuResponsableFk2),
        responsableCedula: reu.reuResponsableFk ?? null,
        asistentes: asistentesDetalle.map((a) => a.nombre),
        asistentesDetalle,
        cantidadAsistentes: asistentesDetalle.length,
        lugar: reu.reuLugar ?? "-",
        estado: this.getDetalleLabel(reu.detParIdEstadoFk2),
        estadoId: reu.detParIdEstadoFk ?? null,
        informe: reu.reuInforme ?? null,
        puedeGestionarInforme: esResponsable,
        puedeEditar: esResponsable,
      };
    });
  }

  async findAprendicesProyectoByReunion(
    reunionId: number,
    cedula: number | string
  ) {
    if (!reunionId) {
      throw new BadRequestException("El id de la reunión es obligatorio.");
    }

    if (!cedula) {
      throw new BadRequestException("La cédula es obligatoria.");
    }

    const reunion = await this.reunionesRepo.findOne({
      where: { reuId: reunionId } as any,
    });

    if (!reunion) {
      throw new NotFoundException("La reunión no existe.");
    }

    const projectIds = await this.getProjectIdsBySprintIds([
      Number(reunion.sprIdFk),
    ]);

    if (!projectIds.length) {
      return [];
    }

    const integrantes = await this.getIntegrantesProyecto(projectIds);

    return integrantes.map((item) => ({
      cedula: item.cedula,
      nombre: item.nombre,
    }));
  }

  async createByAprendizCedula(cedula: number | string, dto: CreateReunionDto) {
    if (!cedula) {
      throw new BadRequestException("La cédula del usuario es obligatoria.");
    }

    if (!dto?.sprIdFk) {
      throw new BadRequestException("El sprint es obligatorio.");
    }

    if (!dto?.detParIdTipoFk) {
      throw new BadRequestException("El tipo de reunión es obligatorio.");
    }

    if (!dto?.reuFecha) {
      throw new BadRequestException("La fecha es obligatoria.");
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { usuCedula: Number(cedula) } as any,
    });

    if (!usuario) {
      throw new NotFoundException("No se encontró el usuario responsable.");
    }

    const reunion = this.reunionesRepo.create({
      sprIdFk: Number(dto.sprIdFk),
      detParIdTipoFk: Number(dto.detParIdTipoFk),
      detParIdEstadoFk: dto.detParIdEstadoFk
        ? Number(dto.detParIdEstadoFk)
        : null,
      reuFecha: dto.reuFecha,
      reuDescripcion: dto.reuDescripcion?.trim() || null,
      reuHora: dto.reuHora ?? null,
      reuLugar: dto.reuLugar?.trim() || null,
      reuResumen: dto.reuResumen?.trim() || null,
      reuInforme: null,
      reuResponsableFk: Number(cedula),
    });

    const saved = await this.reunionesRepo.save(reunion);

    const created = await this.reunionesRepo.findOne({
      where: { reuId: saved.reuId } as any,
      relations: {
        detParIdTipoFk2: true,
        detParIdEstadoFk2: true,
        reuResponsableFk2: true,
      } as any,
    });

    return {
      id: created?.reuId ?? saved.reuId,
      tipo: this.getDetalleLabel(created?.detParIdTipoFk2),
      fecha: created?.reuFecha ?? dto.reuFecha,
      descripcion: created?.reuDescripcion ?? dto.reuDescripcion ?? null,
      hora: created?.reuHora ?? dto.reuHora ?? null,
      responsable: this.getNombreCompleto(created?.reuResponsableFk2),
      responsableCedula: created?.reuResponsableFk ?? Number(cedula),
      asistentes: [],
      asistentesDetalle: [],
      cantidadAsistentes: 0,
      lugar: created?.reuLugar ?? dto.reuLugar ?? "-",
      estado: this.getDetalleLabel(created?.detParIdEstadoFk2),
      estadoId: created?.detParIdEstadoFk ?? dto.detParIdEstadoFk ?? null,
      informe: created?.reuInforme ?? null,
      puedeGestionarInforme: true,
      puedeEditar: true,
      message: "Reunión creada correctamente.",
    };
  }

  async updateByAprendizCedula(
    reunionId: number,
    cedula: number | string,
    dto: CreateReunionDto
  ) {
    if (!reunionId) {
      throw new BadRequestException("El id de la reunión es inválido.");
    }

    if (!cedula) {
      throw new BadRequestException("La cédula del usuario es inválida.");
    }

    const reunion = await this.reunionesRepo.findOne({
      where: { reuId: reunionId } as any,
      relations: {
        reuResponsableFk2: true,
      } as any,
    });

    if (!reunion) {
      throw new NotFoundException("La reunión no existe.");
    }

    if (String(reunion.reuResponsableFk ?? "") !== String(cedula)) {
      throw new ForbiddenException(
        "Solo el responsable que creó la reunión puede editarla."
      );
    }

    if (!dto?.sprIdFk) {
      throw new BadRequestException("El sprint es obligatorio.");
    }

    if (!dto?.detParIdTipoFk) {
      throw new BadRequestException("El tipo de reunión es obligatorio.");
    }

    if (!dto?.reuFecha) {
      throw new BadRequestException("La fecha es obligatoria.");
    }

    reunion.sprIdFk = Number(dto.sprIdFk);
    reunion.detParIdTipoFk = Number(dto.detParIdTipoFk);
    reunion.detParIdEstadoFk = dto.detParIdEstadoFk
      ? Number(dto.detParIdEstadoFk)
      : null;
    reunion.reuFecha = dto.reuFecha;
    reunion.reuDescripcion = dto.reuDescripcion?.trim() || null;
    reunion.reuHora = dto.reuHora ?? null;
    reunion.reuLugar = dto.reuLugar?.trim() || null;
    reunion.reuResumen = dto.reuResumen?.trim() || null;

    await this.reunionesRepo.save(reunion);

    const updated = await this.reunionesRepo.findOne({
      where: { reuId: reunionId } as any,
      relations: {
        detParIdTipoFk2: true,
        detParIdEstadoFk2: true,
        reuResponsableFk2: true,
      } as any,
    });

    const asistentesPorReunion = await this.getAsistentesPorReunion(
      updated ? [updated] : [],
      []
    );

    const asistentesDetalle =
      asistentesPorReunion.get(Number(updated?.reuId ?? 0)) ?? [];

    return {
      id: updated?.reuId ?? reunionId,
      tipo: this.getDetalleLabel(updated?.detParIdTipoFk2),
      fecha: updated?.reuFecha ?? dto.reuFecha,
      descripcion: updated?.reuDescripcion ?? dto.reuDescripcion ?? null,
      hora: updated?.reuHora ?? dto.reuHora ?? null,
      responsable: this.getNombreCompleto(updated?.reuResponsableFk2),
      responsableCedula: updated?.reuResponsableFk ?? null,
      asistentes: asistentesDetalle.map((a) => a.nombre),
      asistentesDetalle,
      cantidadAsistentes: asistentesDetalle.length,
      lugar: updated?.reuLugar ?? dto.reuLugar ?? "-",
      estado: this.getDetalleLabel(updated?.detParIdEstadoFk2),
      estadoId: updated?.detParIdEstadoFk ?? dto.detParIdEstadoFk ?? null,
      informe: updated?.reuInforme ?? null,
      puedeGestionarInforme: true,
      puedeEditar: true,
      message: "Reunión actualizada correctamente.",
    };
  }

  async updateInformeByResponsable(
    reunionId: number,
    cedula: number | string,
    dto: UpdateReunionInformeDto
  ) {
    if (!reunionId) {
      throw new BadRequestException("El id de la reunión es inválido.");
    }

    if (!cedula) {
      throw new BadRequestException("La cédula del usuario es inválida.");
    }

    if (!dto?.reuInforme || !dto.reuInforme.trim()) {
      throw new BadRequestException("El informe de la reunión es obligatorio.");
    }

    const reunion = await this.reunionesRepo.findOne({
      where: { reuId: reunionId } as any,
      relations: {
        detParIdTipoFk2: true,
        detParIdEstadoFk2: true,
        reuResponsableFk2: true,
      } as any,
    });

    if (!reunion) {
      throw new NotFoundException("La reunión no existe.");
    }

    if (String(reunion.reuResponsableFk ?? "") !== String(cedula)) {
      throw new ForbiddenException(
        "Solo el responsable de la reunión puede crear o editar el informe."
      );
    }

    const projectIds = await this.getProjectIdsBySprintIds([
      Number(reunion.sprIdFk),
    ]);

    if (!projectIds.length) {
      throw new BadRequestException(
        "No se encontró el proyecto relacionado con la reunión."
      );
    }

    const integrantesProyecto = await this.getIntegrantesProyecto(projectIds);
    const integrantesPermitidos = new Set(
      integrantesProyecto.map((i) => String(i.cedula))
    );

    const asistentesCedulas = Array.isArray(dto.asistentesCedulas)
      ? [...new Set(dto.asistentesCedulas.map((x) => String(x).trim()).filter(Boolean))]
      : [];

    for (const cedulaAsistente of asistentesCedulas) {
      if (!integrantesPermitidos.has(String(cedulaAsistente))) {
        throw new BadRequestException(
          `El usuario ${cedulaAsistente} no pertenece al proyecto de esta reunión.`
        );
      }
    }

    reunion.reuInforme = dto.reuInforme.trim();
    await this.reunionesRepo.save(reunion);

    await this.reunionesRepo.query(
      `DELETE FROM pro_scrum.usu_reu_pro WHERE reu_id_FK = ?`,
      [reunionId]
    );

    if (asistentesCedulas.length) {
      const proyectoId = Number(projectIds[0]);

      for (const cedulaAsistente of asistentesCedulas) {
        await this.reunionesRepo.query(
          `
          INSERT INTO pro_scrum.usu_reu_pro
          (reu_id_FK, usu_cedula_FK, pro_id_FK)
          VALUES (?, ?, ?)
          `,
          [reunionId, cedulaAsistente, proyectoId]
        );
      }
    }

    const asistentesPorReunion = await this.getAsistentesPorReunion(
      [reunion],
      projectIds
    );

    const asistentesDetalle =
      asistentesPorReunion.get(Number(reunion.reuId)) ?? [];

    return {
      id: reunion.reuId,
      tipo: this.getDetalleLabel(reunion.detParIdTipoFk2),
      fecha: reunion.reuFecha ?? null,
      hora: reunion.reuHora ?? null,
      responsable: this.getNombreCompleto(reunion.reuResponsableFk2),
      responsableCedula: reunion.reuResponsableFk ?? null,
      asistentes: asistentesDetalle.map((a) => a.nombre),
      asistentesDetalle,
      cantidadAsistentes: asistentesDetalle.length,
      lugar: reunion.reuLugar ?? "-",
      estado: this.getDetalleLabel(reunion.detParIdEstadoFk2),
      estadoId: reunion.detParIdEstadoFk ?? null,
      informe: reunion.reuInforme,
      puedeGestionarInforme: true,
      puedeEditar: true,
      message: "Informe de la reunión guardado correctamente.",
    };
  }

  private async getProjectIdsBySprintIds(sprintIds: number[]) {
    const validSprintIds = [
      ...new Set(
        sprintIds
          .map(Number)
          .filter((id) => Number.isFinite(id) && id > 0)
      ),
    ];

    if (!validSprintIds.length) {
      return [];
    }

    const historias = await this.historiaRepo.find({
      where: {
        sprintIdFk: In(validSprintIds),
      } as any,
      select: {
        proIdFk: true,
      } as any,
    });

    return [
      ...new Set(
        historias
          .map((h: any) => Number(h.proIdFk))
          .filter((id) => Number.isFinite(id) && id > 0)
      ),
    ];
  }

  private async getIntegrantesProyecto(projectIds: number[]) {
    const ids = [...new Set(projectIds.map(Number).filter(Boolean))];

    if (!ids.length) {
      return [];
    }

    const sql = `
      SELECT DISTINCT
        CAST(u.usu_cedula AS CHAR) AS cedula,
        TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))) AS nombreCompleto
      FROM pro_scrum.usu_pro_det_par upd
      INNER JOIN pro_scrum.usuario u
        ON u.usu_cedula = upd.usu_cedula
      WHERE upd.pro_ID IN (${ids.join(",")})
      ORDER BY nombreCompleto ASC
    `;

    const rows: any[] = await this.reunionesRepo.query(sql);

    return rows.map((row) => ({
      cedula: String(row.cedula ?? "").trim(),
      nombre: String(row.nombreCompleto ?? "").trim() || "-",
    }));
  }

  private async getAsistentesPorReunion(
    reuniones: Reuniones[],
    projectIds: number[]
  ): Promise<Map<number, AsistenteDetalle[]>> {
    const map = new Map<number, AsistenteDetalle[]>();

    if (!reuniones.length) return map;

    const reunionIds = [
      ...new Set(reuniones.map((r) => Number(r.reuId)).filter(Boolean)),
    ];

    if (!reunionIds.length) return map;

    const projectIdsValid = [
      ...new Set(projectIds.map(Number).filter(Boolean)),
    ];

    let sql = `
      SELECT
        ur.reu_id_FK AS reuIdFk,
        ur.pro_id_FK AS proIdFk,
        CAST(u.usu_cedula AS CHAR) AS usuCedula,
        TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))) AS nombreCompleto
      FROM pro_scrum.usu_reu_pro ur
      INNER JOIN pro_scrum.usuario u
        ON u.usu_cedula = ur.usu_cedula_FK
      WHERE ur.reu_id_FK IN (${reunionIds.join(",")})
    `;

    if (projectIdsValid.length) {
      sql += ` AND ur.pro_id_FK IN (${projectIdsValid.join(",")})`;
    }

    sql += ` ORDER BY ur.reu_id_FK ASC, nombreCompleto ASC`;

    const rawRows: any[] = await this.reunionesRepo.query(sql);

    for (const row of rawRows) {
      const reunionId = Number(row.reuIdFk ?? 0);
      if (!reunionId) continue;

      const cedula = String(row.usuCedula ?? "").trim();
      const nombre =
        String(row.nombreCompleto ?? "").trim() || cedula || "-";

      if (!map.has(reunionId)) {
        map.set(reunionId, []);
      }

      map.get(reunionId)!.push({
        cedula,
        nombre,
      });
    }

    return map;
  }

  private getDetalleLabel(detalle?: any): string {
    if (!detalle) return "-";

    return (
      detalle.detParDescripcion?.trim?.() ||
      detalle.detParNombre?.trim?.() ||
      detalle.detParValor?.trim?.() ||
      `${detalle.detParId ?? "-"}`
    );
  }

  private getNombreCompleto(usuario?: any): string {
    if (!usuario) return "-";

    const nombres = usuario.usuNombres?.trim?.() ?? "";
    const apellidos = usuario.usuApellidos?.trim?.() ?? "";

    return `${nombres} ${apellidos}`.trim() || "-";
  }
}