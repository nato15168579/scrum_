"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const AppModule_1 = require("./AppModule");
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule_1.AppModule);
    app.enableCors();
    await app.listen(5000);
    console.log('Servidor corriendo en: http://localhost:5000');
}
bootstrap();
//# sourceMappingURL=main.js.map