/**
 * CambiosSistemaModule
 * -------------------
 * Modulo NestJS del feature `cambios_sistema` (Admin).
 */
import { Module } from "@nestjs/common";
import { CambiosSistemaController } from "./CambiosSistemaController";
import { CambiosSistemaService } from "./CambiosSistemaService";

@Module({
  controllers: [CambiosSistemaController],
  providers: [CambiosSistemaService],
})
export class CambiosSistemaModule {}
