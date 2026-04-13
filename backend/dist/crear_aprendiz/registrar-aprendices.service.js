"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarAprendicesService = void 0;
const common_1 = require("@nestjs/common");
const ListaService_1 = require("../lista_aprendices/ListaService");
let RegistrarAprendicesService = class RegistrarAprendicesService {
    constructor(listaService) {
        this.listaService = listaService;
    }
    normalizeText(value) {
        return String(value !== null && value !== void 0 ? value : '').trim();
    }
    async getInstructorByCedula(instructorCedulaRaw) {
        const instructorCedula = this.normalizeText(instructorCedulaRaw);
        if (!instructorCedula) {
            throw new common_1.BadRequestException('La cedula del instructor es obligatoria.');
        }
        const instructores = await this.listaService.findAllInstructores();
        const instructor = instructores.find((item) => this.normalizeText(item.documento) === instructorCedula);
        if (!instructor) {
            throw new common_1.NotFoundException('No se encontro el instructor solicitado.');
        }
        return instructor;
    }
    async getInstructorFichasActivas(instructorCedulaRaw) {
        const instructor = await this.getInstructorByCedula(instructorCedulaRaw);
        const fichasActivas = (instructor.fichasDetalle || [])
            .filter((item) => this.normalizeText(item.estado) === 'Activa')
            .sort((left, right) => Number(left.ficha) - Number(right.ficha));
        if (fichasActivas.length === 0) {
            throw new common_1.BadRequestException('El instructor no tiene fichas activas a cargo.');
        }
        return fichasActivas;
    }
    async ensureFichaPerteneceAlInstructor(instructorCedulaRaw, fichaRaw) {
        const ficha = this.normalizeText(fichaRaw);
        if (!ficha) {
            throw new common_1.BadRequestException('Debes seleccionar una ficha.');
        }
        const fichasActivas = await this.getInstructorFichasActivas(instructorCedulaRaw);
        const fichaSeleccionada = fichasActivas.find((item) => this.normalizeText(item.ficha) === ficha);
        if (!fichaSeleccionada) {
            throw new common_1.BadRequestException('La ficha seleccionada no pertenece a las fichas del instructor.');
        }
        return fichaSeleccionada;
    }
    async crear(datos) {
        const fichaSeleccionada = await this.ensureFichaPerteneceAlInstructor(datos.instructorCedula, datos.usuFicha);
        return await this.listaService.createUsuario({
            tipoUsuario: 'aprendiz',
            cedula: this.normalizeText(datos.usuCedula),
            tipoDocumento: this.normalizeText(datos.usuTipodedocumento).toUpperCase() || 'CC',
            nombre: this.normalizeText(datos.usuNombres),
            apellidos: this.normalizeText(datos.usuApellidos),
            correo: this.normalizeText(datos.usuCorreo) || undefined,
            telefono: this.normalizeText(datos.usuTelefono) || undefined,
            ficha: fichaSeleccionada.ficha,
            sexo: this.normalizeText(datos.usuSexo) || undefined,
        });
    }
    async obtenerFichasInstructor(instructorCedulaRaw) {
        const instructor = await this.getInstructorByCedula(instructorCedulaRaw);
        const fichas = (instructor.fichasDetalle || [])
            .filter((item) => this.normalizeText(item.estado) === 'Activa')
            .sort((left, right) => Number(left.ficha) - Number(right.ficha));
        return fichas.map((item) => ({
            numero: this.normalizeText(item.ficha),
            area: this.normalizeText(item.nombre),
            nombre: this.normalizeText(item.nombre),
            programa: this.normalizeText(item.programa),
            estado: this.normalizeText(item.estado) || 'Activa',
        }));
    }
    async importarAprendices(payload) {
        const fichasActivas = await this.getInstructorFichasActivas(payload.instructorCedula);
        const fichasPermitidas = new Set(fichasActivas.map((item) => this.normalizeText(item.ficha)));
        const usuarios = Array.isArray(payload.usuarios) ? payload.usuarios : [];
        if (usuarios.length === 0) {
            throw new common_1.BadRequestException('Debes enviar al menos un aprendiz para importar.');
        }
        const fichasInvalidas = usuarios
            .map((item, index) => ({
            fila: index + 2,
            documento: this.normalizeText(item.documento) || 'Sin documento',
            ficha: this.normalizeText(item.ficha),
        }))
            .filter((item) => !fichasPermitidas.has(item.ficha));
        if (fichasInvalidas.length > 0) {
            throw new common_1.BadRequestException({
                message: 'El archivo contiene aprendices con fichas fuera del cargo del instructor.',
                errors: fichasInvalidas.map((item) => ({
                    fila: item.fila,
                    documento: item.documento,
                    message: `La ficha ${item.ficha || 'sin valor'} no esta asignada al instructor.`,
                })),
            });
        }
        const rows = usuarios.map((item) => ({
            documento: this.normalizeText(item.documento),
            tipoDocumento: this.normalizeText(item.tipoDocumento).toUpperCase() || 'CC',
            ficha: this.normalizeText(item.ficha),
            nombre: this.normalizeText(item.nombre),
            apellido: this.normalizeText(item.apellido),
            sexo: this.normalizeText(item.sexo) || undefined,
            telefono: this.normalizeText(item.telefono) || undefined,
            email: this.normalizeText(item.email) || undefined,
            tipoUsuario: 'aprendiz',
        }));
        return await this.listaService.importUsuarios(rows);
    }
    async listar() {
        return await this.listaService.findAllAprendices();
    }
};
exports.RegistrarAprendicesService = RegistrarAprendicesService;
exports.RegistrarAprendicesService = RegistrarAprendicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ListaService_1.ListaService])
], RegistrarAprendicesService);
//# sourceMappingURL=registrar-aprendices.service.js.map