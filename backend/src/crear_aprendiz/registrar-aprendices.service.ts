import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ListaService } from '../lista_aprendices/ListaService';
import { ImportUsuarioDto, InstructorResponse } from '../lista_aprendices/ListaTypes';

interface RegistrarAprendizPayload {
  instructorCedula?: string | number;
  usuCedula?: string | number;
  usuNombres?: string;
  usuApellidos?: string;
  usuCorreo?: string;
  usuTelefono?: string;
  usuTipodedocumento?: string;
  usuFicha?: string | number;
  usuSexo?: string;
}

interface ImportarAprendicesPayload {
  instructorCedula?: string | number;
  usuarios?: Array<{
    documento?: string | number;
    tipoDocumento?: string;
    ficha?: string | number;
    nombre?: string;
    apellido?: string;
    sexo?: string;
    telefono?: string;
    email?: string;
  }>;
}

@Injectable()
export class RegistrarAprendicesService {
  constructor(private readonly listaService: ListaService) {}

  private normalizeText(value: unknown) {
    return String(value ?? '').trim();
  }

  private async getInstructorByCedula(
    instructorCedulaRaw: string | number | undefined,
  ): Promise<InstructorResponse> {
    const instructorCedula = this.normalizeText(instructorCedulaRaw);

    if (!instructorCedula) {
      throw new BadRequestException(
        'La cedula del instructor es obligatoria.',
      );
    }

    const instructores = await this.listaService.findAllInstructores();
    const instructor = instructores.find(
      (item) => this.normalizeText(item.documento) === instructorCedula,
    );

    if (!instructor) {
      throw new NotFoundException('No se encontro el instructor solicitado.');
    }

    return instructor;
  }

  private async getInstructorFichasActivas(
    instructorCedulaRaw: string | number | undefined,
  ) {
    const instructor = await this.getInstructorByCedula(instructorCedulaRaw);
    const fichasActivas = (instructor.fichasDetalle || [])
      .filter((item) => this.normalizeText(item.estado) === 'Activa')
      .sort((left, right) => Number(left.ficha) - Number(right.ficha));

    if (fichasActivas.length === 0) {
      throw new BadRequestException(
        'El instructor no tiene fichas activas a cargo.',
      );
    }

    return fichasActivas;
  }

  private async ensureFichaPerteneceAlInstructor(
    instructorCedulaRaw: string | number | undefined,
    fichaRaw: string | number | undefined,
  ) {
    const ficha = this.normalizeText(fichaRaw);

    if (!ficha) {
      throw new BadRequestException('Debes seleccionar una ficha.');
    }

    const fichasActivas = await this.getInstructorFichasActivas(
      instructorCedulaRaw,
    );
    const fichaSeleccionada = fichasActivas.find(
      (item) => this.normalizeText(item.ficha) === ficha,
    );

    if (!fichaSeleccionada) {
      throw new BadRequestException(
        'La ficha seleccionada no pertenece a las fichas del instructor.',
      );
    }

    return fichaSeleccionada;
  }

  async crear(datos: RegistrarAprendizPayload) {
    const fichaSeleccionada = await this.ensureFichaPerteneceAlInstructor(
      datos.instructorCedula,
      datos.usuFicha,
    );

    return await this.listaService.createUsuario({
      tipoUsuario: 'aprendiz',
      cedula: this.normalizeText(datos.usuCedula),
      tipoDocumento:
        this.normalizeText(datos.usuTipodedocumento).toUpperCase() || 'CC',
      nombre: this.normalizeText(datos.usuNombres),
      apellidos: this.normalizeText(datos.usuApellidos),
      correo: this.normalizeText(datos.usuCorreo) || undefined,
      telefono: this.normalizeText(datos.usuTelefono) || undefined,
      ficha: fichaSeleccionada.ficha,
      sexo: this.normalizeText(datos.usuSexo) || undefined,
    });
  }

  async obtenerFichasInstructor(
    instructorCedulaRaw: string | number | undefined,
  ) {
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

  async importarAprendices(payload: ImportarAprendicesPayload) {
    const fichasActivas = await this.getInstructorFichasActivas(
      payload.instructorCedula,
    );
    const fichasPermitidas = new Set(
      fichasActivas.map((item) => this.normalizeText(item.ficha)),
    );
    const usuarios = Array.isArray(payload.usuarios) ? payload.usuarios : [];

    if (usuarios.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un aprendiz para importar.',
      );
    }

    const fichasInvalidas = usuarios
      .map((item, index) => ({
        fila: index + 2,
        documento: this.normalizeText(item.documento) || 'Sin documento',
        ficha: this.normalizeText(item.ficha),
      }))
      .filter((item) => !fichasPermitidas.has(item.ficha));

    if (fichasInvalidas.length > 0) {
      throw new BadRequestException({
        message:
          'El archivo contiene aprendices con fichas fuera del cargo del instructor.',
        errors: fichasInvalidas.map((item) => ({
          fila: item.fila,
          documento: item.documento,
          message: `La ficha ${item.ficha || 'sin valor'} no esta asignada al instructor.`,
        })),
      });
    }

    const rows: ImportUsuarioDto[] = usuarios.map((item) => ({
      documento: this.normalizeText(item.documento),
      tipoDocumento:
        this.normalizeText(item.tipoDocumento).toUpperCase() || 'CC',
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
}
