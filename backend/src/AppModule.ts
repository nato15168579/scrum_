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
import { DashboardModule as DashboardStudentModule } from './dashboard_Students/DashboardModule';
import { ListaModule } from './lista_aprendices/ListaModules';
import { CrearproModule } from './crear_proyecto/CrearproModules';
import { AsigProyectoModule } from './asignar_proyecto/AsigproyectoModules';
import { AsigProVerModule } from './asignar_proyecto/asignar_proyecto_vermas/AsigproverModules';
import { VerproModule } from './ver_proyecto/VerproModules';
import { CambiosSistemaModule } from './cambios_sistema/CambiosSistemaModule';

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
    DashboardStudentModule,
    ListaModule,
    CrearproModule,
    AsigProyectoModule,
    AsigProVerModule,
    VerproModule,
    CambiosSistemaModule,
  ],
})
export class AppModule {}
