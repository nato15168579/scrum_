import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from './login/login.module';
import { DashboardModule } from './dashboard_Instructor/dashboard.modules';
import { DashboardModule as DashboardAdminModule } from './dashboard_admin/dashboard.modules';
import { DashboardModule as DashboardStudentModule } from './dashboard_Students/dashboard.module';
import { ListaModule } from './lista_aprendices/lista.modules';
import { CrearproModule } from './crear_proyecto/crearpro.modules';
import { AsigProyectoModule } from './asignar_proyecto/asigproyecto.modules'
import { AsigProVerModule } from './asignar_proyecto/asignar_proyecto_vermas/asigprover.modules'
import { VerproModule } from './ver_proyecto/verpro.modules'
import { Proyecto } from './entities/Proyecto';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '', 
      database: 'pro_scrum',
      entities: [__dirname + '/entities/*.entity{.ts,.js}', __dirname + '/entities/*{.ts,.js}'],
      synchronize: false,
    }),
    LoginModule,
    // importamos los tres tipos de dashboards
    DashboardModule,        // instructor
    DashboardAdminModule,   // administrador
    DashboardStudentModule,
    ListaModule,
    CrearproModule,
    AsigProyectoModule,
    AsigProVerModule,
    VerproModule,
  ],
})
export class AppModule {}