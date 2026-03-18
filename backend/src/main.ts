/**
 * API Bootstrap (NestJS)
 * ---------------------
 * Punto de entrada del backend.
 *
 * Responsabilidades:
 * - Cargar variables de entorno (`loadEnv.ts`).
 * - Verificar disponibilidad del puerto (mejor UX en desarrollo cuando ya hay un proceso).
 * - Crear la app Nest y habilitar CORS.
 *
 * Nota de produccion:
 * - Configurar CORS con origenes permitidos (no usar `enableCors()` sin opciones).
 * - Ejecutar detras de un reverse proxy con TLS y timeouts controlados.
 */
import './loadEnv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'node:net';
import { AppModule } from './AppModule';

async function ensurePortAvailable(port: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const tester = createServer()
      .once('error', (error: NodeJS.ErrnoException) => {
        tester.close();
        reject(error);
      })
      .once('listening', () => {
        tester.close(() => resolve());
      });

    tester.listen(port);
  });
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = Number(process.env.PORT || 5000);

  try {
    await ensurePortAvailable(port);
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    await app.listen(port);
    logger.log(`Servidor corriendo en: http://localhost:${port}`);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === 'EADDRINUSE') {
      logger.error(
        `El puerto ${port} ya esta en uso. Cierra la instancia actual o inicia el backend con otro puerto, por ejemplo: $env:PORT=${port + 1}; npm run start:dev`,
      );
      process.exit(1);
    }

    throw error;
  }
}

bootstrap();
