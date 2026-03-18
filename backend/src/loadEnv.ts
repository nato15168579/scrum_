/**
 * loadEnv
 * ------
 * Carga `.env` si existe (desarrollo/local).
 *
 * Se buscan rutas candidatas para tolerar distintas formas de ejecucion:
 * - `backend/dist` (cuando se compila)
 * - `process.cwd()` (cuando se ejecuta desde la raiz del proyecto)
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';

const candidatePaths = [
  resolve(__dirname, '..', '.env'),
  resolve(process.cwd(), '.env'),
];

for (const envPath of candidatePaths) {
  if (!existsSync(envPath)) {
    continue;
  }

  loadEnv({ path: envPath });
  break;
}
