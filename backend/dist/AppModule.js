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
const DashboardModule_1 = require("./dashboard_Students/DashboardModule");
const ListaModules_1 = require("./lista_aprendices/ListaModules");
const CrearproModules_1 = require("./crear_proyecto/CrearproModules");
const AsigproyectoModules_1 = require("./asignar_proyecto/AsigproyectoModules");
const AsigproverModules_1 = require("./asignar_proyecto/asignar_proyecto_vermas/AsigproverModules");
const VerproModules_1 = require("./ver_proyecto/VerproModules");
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
            LoginModule_1.LoginModule,
            DashboardModules_1.DashboardModule,
            DashboardModule_1.DashboardModule,
            ListaModules_1.ListaModule,
            CrearproModules_1.CrearproModule,
            AsigproyectoModules_1.AsigProyectoModule,
            AsigproverModules_1.AsigProVerModule,
            VerproModules_1.VerproModule,
        ],
    })
], AppModule);
//# sourceMappingURL=AppModule.js.map