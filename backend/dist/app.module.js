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
const login_module_1 = require("./login/login.module");
const dashboard_modules_1 = require("./dashboard_Instructor/dashboard.modules");
const dashboard_module_1 = require("./dashboard_Students/dashboard.module");
const lista_modules_1 = require("./lista_aprendices/lista.modules");
const crearpro_modules_1 = require("./crear_proyecto/crearpro.modules");
const asigproyecto_modules_1 = require("./asignar_proyecto/asigproyecto.modules");
const asigprover_modules_1 = require("./asignar_proyecto/asignar_proyecto_vermas/asigprover.modules");
const verpro_modules_1 = require("./ver_proyecto/verpro.modules");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: '',
                database: 'pro_scrum',
                entities: [__dirname + '/entities/*.entity{.ts,.js}', __dirname + '/entities/*{.ts,.js}'],
                synchronize: false,
            }),
            login_module_1.LoginModule,
            dashboard_modules_1.DashboardModule,
            dashboard_module_1.DashboardModule,
            lista_modules_1.ListaModule,
            crearpro_modules_1.CrearproModule,
            asigproyecto_modules_1.AsigProyectoModule,
            asigprover_modules_1.AsigProVerModule,
            verpro_modules_1.VerproModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map