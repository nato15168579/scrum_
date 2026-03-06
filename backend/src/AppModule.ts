import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from './login/LoginModule';
import { DashboardModule } from './dashboard_administrador/DashboardModules';
import { DashboardModule as DashboardStudentModule } from './dashboard_Students/DashboardModule';
import { ListaModule } from './lista_aprendices/ListaModules';
import { CrearproModule } from './crear_proyecto/CrearproModules';
import { AsigProyectoModule } from './asignar_proyecto/AsigproyectoModules'
import { AsigProVerModule } from './asignar_proyecto/asignar_proyecto_vermas/AsigproverModules'
import { VerproModule } from './ver_proyecto/VerproModules'
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
    // importamos únicamente el dashboard principal y el de estudiantes
    DashboardModule,   // administrador (unidad única)
    DashboardStudentModule,
    ListaModule,
    CrearproModule,
    AsigProyectoModule,
    AsigProVerModule,
    VerproModule,
  ],
})
export class AppModule {}