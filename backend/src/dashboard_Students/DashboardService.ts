import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, DataSource } from 'typeorm';
import { Usuario } from '../entities/Usuario';
import { Proyecto } from '../entities/Proyecto';

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
      const usuario = await this.usuarioRepository.findOneBy({
        usuCedula: cedula,
      });

      if (!usuario) {
        this.logger.warn(`Usuario con cédula ${cedula} no encontrado`);
        return { error: 'Usuario no encontrado' };
      }

      // 2. CONTEO DE REUNIONES
      let reunionesCount = 0;
      try {
        const queryResult = await this.dataSource.query(
          'SELECT COUNT(*) as total FROM reuniones WHERE usu_cedula = ?',
          [cedula],
        );
        reunionesCount = parseInt(queryResult[0].total) || 0;
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.logger.error('Error al consultar reuniones:', error.message);
      }

      // 3. PROYECTOS DEL USUARIO
      let proyectos = [];
      let porHacer = 0;
      let enProgreso = 0;
      let hecho = 0;

      try {
        proyectos = await this.proyectoRepository.find();
        porHacer = proyectos.filter((p) => p.estadoId === 1).length;
        enProgreso = proyectos.filter((p) => p.estadoId === 2).length;
        hecho = proyectos.filter((p) => p.estadoId === 3).length;
      } catch (e) {
        this.logger.error('Error al procesar proyectos:', e.message);
      }

      // 4. RESPUESTA PARA EL FRONTEND
      return {
        instructor: `${usuario.usuNombres || ''} ${usuario.usuApellidos || ''}`.trim(),
        correo: usuario.usuCorreo || 'Sin correo',
        description:
          'Facilitar la gestión, administración y monitoreo de los proyectos desarrollados por los aprendices del SENA mediante una aplicación basada en la metodología ágil Scrum.',
        stats: [
          { label: 'Mis tareas Activas', value: porHacer },
          { label: 'Tareas Completadas', value: hecho },
          { label: 'Participación en reuniones', value: reunionesCount },
          { label: 'Retroalimentaciones recibidas', value: 0 },
        ],
        proyectosData: {
          total: proyectos.length,
          porHacer,
          enProgreso,
          hecho,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error crítico en DashboardService:', err.message);
      throw err;
    }
  }
}
