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
