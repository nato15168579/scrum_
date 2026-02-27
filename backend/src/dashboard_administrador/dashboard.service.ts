import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull, DataSource } from "typeorm";
import { Usuario } from "../entities/Usuario";
import { Proyecto } from "../entities/Proyecto";

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    private dataSource: DataSource,
  ) {}

  async obtenerDatosDashboard(cedulaInput: any) {
    try {
      const cedula = Number(cedulaInput);

      // 1. OBTENER DATOS DEL USUARIO
      // Usamos findOneBy para evitar problemas de tipos con la cédula
      const usuario = await this.usuarioRepository.findOneBy({
        usuCedula: cedula,
      });

      if (!usuario) {
        this.logger.warn(`Usuario con cédula ${cedula} no encontrado`);
        return { error: "Usuario no encontrado" };
      }

      // 2. CONTEO DE REUNIONES (Consultando la tabla intermedia usu_asis)
      // En tu Usuario.ts definiste: @JoinTable({ name: "usu_asis" ... })
      let reunionesCount = 0;
      try {
        const queryResult = await this.dataSource.query(
          "SELECT COUNT(*) as total FROM usu_asis WHERE usu_cedula = ?",
          [cedula],
        );
        reunionesCount = parseInt(queryResult[0].total) || 0;
      } catch (e) {
        this.logger.error(
          "Error al consultar la tabla intermedia usu_asis:",
          e.message,
        );
      }

      // 3. CONTEO DE FICHAS ÚNICAS
      let totalFichasSena = 0;
      try {
        const usuariosConFicha = await this.usuarioRepository.find({
          where: { usuFicha: Not(IsNull()) },
          select: ["usuFicha"],
        });
        const fichasUnicas = [
          ...new Set(usuariosConFicha.map((u) => u.usuFicha)),
        ];
        totalFichasSena = fichasUnicas.filter((f) => f).length;
      } catch (e) {
        this.logger.error("Error al calcular fichas:", e.message);
      }

      // 4. PROCESAMIENTO DE PROYECTOS
      let proyectos = await this.proyectoRepository.find();

      const porHacer = proyectos.filter(
        (p) => Number((p as any).detParIdFk || (p as any).det_par_id_fk) === 1,
      ).length;
      const enProgreso = proyectos.filter(
        (p) => Number((p as any).detParIdFk || (p as any).det_par_id_fk) === 2,
      ).length;
      const hecho = proyectos.filter(
        (p) => Number((p as any).detParIdFk || (p as any).det_par_id_fk) === 3,
      ).length;

      // 5. RESPUESTA PARA EL FRONTEND
      // Aquí usamos los nombres EXACTOS de tu Usuario.ts
      return {
        instructor:
          `${usuario.usuNombres || ""} ${usuario.usuApellidos || ""}`.trim(),
        correo: usuario.usuCorreo || "Sin correo",
        description:
          "Bienvenido al centro de administración del sistema. Desde aquí puedes supervisar el estado general de la plataforma, gestionar usuarios, monitorear proyectos y dar seguimiento a reportes en tiempo real.Este panel te ofrece una visión estratégica del rendimiento, crecimiento y actividad del sistema, permitiéndote tomar decisiones informadas y mantener el control operativo en todo momento.Utiliza el menú lateral para acceder a cada módulo y administrar los recursos de forma eficiente.",
        stats: [
          { label: "Cantidad de fichas", value: totalFichasSena },
          { label: "Reuniones observadas", value: reunionesCount },
          { label: "Proyectos (Global)", value: proyectos.length },
        ],
        proyectosData: {
          total: proyectos.length,
          porHacer,
          enProgreso,
          hecho,
        },
      };
    } catch (error) {
      this.logger.error("Error crítico en DashboardService:", error.message);
      throw new Error(`Error interno: ${error.message}`);
    }
  }
}
