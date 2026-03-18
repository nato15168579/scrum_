/**
 * LoginModule
 * -----------
 * Modulo NestJS para login.
 *
 * Registra:
 * - LoginController (endpoint HTTP)
 * - LoginService (validacion de credenciales)
 *
 * Dependencias:
 * - Repositorio TypeORM de `Usuario`.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from './LoginController';
import { LoginService } from './LoginService';
import { Usuario } from '../entities/Usuario'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
