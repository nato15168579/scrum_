"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const LoginController_1 = require("./LoginController");
const LoginService_1 = require("./LoginService");
const PasswordRecoveryService_1 = require("./PasswordRecoveryService");
const PasswordRecoveryEmailService_1 = require("./PasswordRecoveryEmailService");
const Usuario_1 = require("../entities/Usuario");
const PasswordRecoveryCode_1 = require("../entities/PasswordRecoveryCode");
let LoginModule = class LoginModule {
};
exports.LoginModule = LoginModule;
exports.LoginModule = LoginModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([Usuario_1.Usuario, PasswordRecoveryCode_1.PasswordRecoveryCode])],
        controllers: [LoginController_1.LoginController],
        providers: [
            LoginService_1.LoginService,
            PasswordRecoveryService_1.PasswordRecoveryService,
            PasswordRecoveryEmailService_1.PasswordRecoveryEmailService,
        ],
    })
], LoginModule);
//# sourceMappingURL=LoginModule.js.map