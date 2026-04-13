/**
 * AppModule
 * ---------
 * Modulo raiz de NestJS.
 *
 * - Configura conexion a MySQL via TypeORM usando variables de entorno.
 * - Registra los feature-modules que exponen la API (auth, admin, estudiantes, etc.).
 *
 * Nota: `synchronize` esta deshabilitado a proposito para no mutar el esquema en runtime.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from './login/LoginModule';
import { DashboardModule } from './dashboard_administrador/DashboardModules';
import { AprendizDashboardModule } from './dashboard_aprendiz/aprendizDashboard.module';
import { ListaModule } from './lista_aprendices/ListaModules';
import { CrearproModule } from './crear_proyecto/CrearproModules';
import { AsigProyectoModule } from './asignar_proyecto/asigproyecto.modules';
import { AsigIntegrantesModule } from './asignar_proyecto/asignar_integrantes/asig-integrantes.module';
import { VerproModule } from './ver_proyecto/VerproModules';
import { CambiosSistemaModule } from './cambios_sistema/CambiosSistemaModule';
import { MiPerfilModule } from './mi_perfil/mi_perfil.modules';
import { CambiarContrasenaModule } from './mi_perfil/cambiar_contrasena/cambiar_contrasena.module';
import { ActualizarDatoModule } from './mi_perfil/actualizar_dato/actualizar_dato.modules';
import { DetproModule } from './ver_proyecto/detalle_proyecto/detpro.modules';
import { IntegrantesModule } from './ver_proyecto/detalle_proyecto/editar_integrantes/integrantes.module';
import { HistoriasModule } from './ver_proyecto/detalle_proyecto/ver_historia_usuario/historias.module'; 
import { CriterioModule } from './ver_proyecto/detalle_proyecto/ver_historia_usuario/criterios/criterio.module';
import { ReunionModule } from './ver_proyecto/detalle_proyecto/reuniones/reuniones.module';
import { SugerenciaModule } from './ver_proyecto/detalle_proyecto/sugerencia/sugerencia.module';
import { RegistrarAprendicesModule } from './crear_aprendiz/registrar-aprendices.module';

import { MiProyectoModule } from "./aprendiz_mi_proyecto/aprendizMiProyecto.module";
import { AprendizHistoriasModule } from "./aprendiz_historias/aprendizHistorias.module";
import { AprendizCriteriosModule } from "./aprendiz_criterios/aprendizCriterios.module";
import { AprendizReunionesModule } from "./aprendiz_reuniones/aprendizReuniones.module";
import { AprendizObservacionesModule } from "./aprendiz_observaciones/aprendizObservaciones.module";



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'pro_scrum',
      entities: [__dirname + '/entities/*.entity{.ts,.js}', __dirname + '/entities/*{.ts,.js}'],
      synchronize: false,
    }),
    LoginModule,
    // importamos únicamente el dashboard principal y el de estudiantes
    DashboardModule,   // administrador (unidad única)
    AprendizDashboardModule,
    ListaModule,
    CrearproModule,
    AsigProyectoModule,
    AsigIntegrantesModule,
    VerproModule,
    CambiosSistemaModule,
    MiPerfilModule,
    CambiarContrasenaModule,
    ActualizarDatoModule,
    DetproModule,
    IntegrantesModule,
    HistoriasModule,
    CriterioModule,
    ReunionModule,
    SugerenciaModule,
    RegistrarAprendicesModule,

    MiProyectoModule, 
    AprendizHistoriasModule,
    AprendizCriteriosModule,
    AprendizReunionesModule,
    AprendizObservacionesModule,


  ],
})
export class AppModule {}
