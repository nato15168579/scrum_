"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const LoginModule_1 = require("./login/LoginModule");
const DashboardModules_1 = require("./dashboard_administrador/DashboardModules");
const aprendizDashboard_module_1 = require("./dashboard_aprendiz/aprendizDashboard.module");
const ListaModules_1 = require("./lista_aprendices/ListaModules");
const CrearproModules_1 = require("./crear_proyecto/CrearproModules");
const asigproyecto_modules_1 = require("./asignar_proyecto/asigproyecto.modules");
const asig_integrantes_module_1 = require("./asignar_proyecto/asignar_integrantes/asig-integrantes.module");
const VerproModules_1 = require("./ver_proyecto/VerproModules");
const CambiosSistemaModule_1 = require("./cambios_sistema/CambiosSistemaModule");
const mi_perfil_modules_1 = require("./mi_perfil/mi_perfil.modules");
const cambiar_contrasena_module_1 = require("./mi_perfil/cambiar_contrasena/cambiar_contrasena.module");
const actualizar_dato_modules_1 = require("./mi_perfil/actualizar_dato/actualizar_dato.modules");
const detpro_modules_1 = require("./ver_proyecto/detalle_proyecto/detpro.modules");
const integrantes_module_1 = require("./ver_proyecto/detalle_proyecto/editar_integrantes/integrantes.module");
const historias_module_1 = require("./ver_proyecto/detalle_proyecto/ver_historia_usuario/historias.module");
const criterio_module_1 = require("./ver_proyecto/detalle_proyecto/ver_historia_usuario/criterios/criterio.module");
const reuniones_module_1 = require("./ver_proyecto/detalle_proyecto/reuniones/reuniones.module");
const sugerencia_module_1 = require("./ver_proyecto/detalle_proyecto/sugerencia/sugerencia.module");
const registrar_aprendices_module_1 = require("./crear_aprendiz/registrar-aprendices.module");
const aprendizMiProyecto_module_1 = require("./aprendiz_mi_proyecto/aprendizMiProyecto.module");
const aprendizHistorias_module_1 = require("./aprendiz_historias/aprendizHistorias.module");
const aprendizCriterios_module_1 = require("./aprendiz_criterios/aprendizCriterios.module");
const aprendizReuniones_module_1 = require("./aprendiz_reuniones/aprendizReuniones.module");
const aprendizObservaciones_module_1 = require("./aprendiz_observaciones/aprendizObservaciones.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || '127.0.0.1',
                port: Number(process.env.DB_PORT || 3306),
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_DATABASE || 'pro_scrum',
                entities: [__dirname + '/entities/*.entity{.ts,.js}', __dirname + '/entities/*{.ts,.js}'],
                synchronize: false,
            }),
            LoginModule_1.LoginModule,
            DashboardModules_1.DashboardModule,
            aprendizDashboard_module_1.AprendizDashboardModule,
            ListaModules_1.ListaModule,
            CrearproModules_1.CrearproModule,
            asigproyecto_modules_1.AsigProyectoModule,
            asig_integrantes_module_1.AsigIntegrantesModule,
            VerproModules_1.VerproModule,
            CambiosSistemaModule_1.CambiosSistemaModule,
            mi_perfil_modules_1.MiPerfilModule,
            cambiar_contrasena_module_1.CambiarContrasenaModule,
            actualizar_dato_modules_1.ActualizarDatoModule,
            detpro_modules_1.DetproModule,
            integrantes_module_1.IntegrantesModule,
            historias_module_1.HistoriasModule,
            criterio_module_1.CriterioModule,
            reuniones_module_1.ReunionModule,
            sugerencia_module_1.SugerenciaModule,
            registrar_aprendices_module_1.RegistrarAprendicesModule,
            aprendizMiProyecto_module_1.MiProyectoModule,
            aprendizHistorias_module_1.AprendizHistoriasModule,
            aprendizCriterios_module_1.AprendizCriteriosModule,
            aprendizReuniones_module_1.AprendizReunionesModule,
            aprendizObservaciones_module_1.AprendizObservacionesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=AppModule.js.map