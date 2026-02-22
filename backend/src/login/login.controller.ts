import { Controller, Post, Body, Get } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  async login(@Body() body: any) {
    // se recibe la cédula y la contraseña desde el frontend
    return this.loginService.validarUsuario(body.cedula, body.pass);
  }
}