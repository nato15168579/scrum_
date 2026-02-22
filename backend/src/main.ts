import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👈 ESTA LÍNEA ES VITAL: Permite que React se comunique con el servidor
  app.enableCors(); 

  // Asegúrate de que el puerto coincida con tu .env de React
  await app.listen(5000);
  console.log('Servidor corriendo en: http://localhost:5000');
}
bootstrap();