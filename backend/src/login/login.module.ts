import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { Usuario } from '../entities/Usuario'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}