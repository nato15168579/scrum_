/**
 * LoginModule
 * -----------
 * Modulo NestJS para login y recuperacion de contrasena.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from './LoginController';
import { LoginService } from './LoginService';
import { PasswordRecoveryService } from './PasswordRecoveryService';
import { PasswordRecoveryEmailService } from './PasswordRecoveryEmailService';
import { Usuario } from '../entities/Usuario';
import { PasswordRecoveryCode } from '../entities/PasswordRecoveryCode';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, PasswordRecoveryCode])],
  controllers: [LoginController],
  providers: [
    LoginService,
    PasswordRecoveryService,
    PasswordRecoveryEmailService,
  ],
})
export class LoginModule {}
