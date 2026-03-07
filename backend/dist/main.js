"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const node_net_1 = require("node:net");
const AppModule_1 = require("./AppModule");
async function ensurePortAvailable(port) {
    await new Promise((resolve, reject) => {
        const tester = (0, node_net_1.createServer)()
            .once('error', (error) => {
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
    const logger = new common_1.Logger('Bootstrap');
    const port = Number(process.env.PORT || 5000);
    try {
        await ensurePortAvailable(port);
        const app = await core_1.NestFactory.create(AppModule_1.AppModule);
        app.enableCors();
        await app.listen(port);
        logger.log(`Servidor corriendo en: http://localhost:${port}`);
    }
    catch (error) {
        const err = error;
        if (err.code === 'EADDRINUSE') {
            logger.error(`El puerto ${port} ya esta en uso. Cierra la instancia actual o inicia el backend con otro puerto, por ejemplo: $env:PORT=${port + 1}; npm run start:dev`);
            process.exit(1);
        }
        throw error;
    }
}
bootstrap();
//# sourceMappingURL=main.js.map