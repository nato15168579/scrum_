export class CreateReunionDto {
  sprIdFk: number;
  detParIdTipoFk: number;
  detParIdEstadoFk?: number;
  reuFecha: string;
  reuDescripcion?: string;
  reuHora?: string;
  reuLugar?: string;
  reuResumen?: string;
}