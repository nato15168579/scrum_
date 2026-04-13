/**
 * Reuniones entity
 * ---------------
 * Mapeo TypeORM de la tabla `reuniones`.
 *
 * Representa reuniones asociadas a un sprint, con tipo, estado,
 * responsable, resumen e informe.
 */
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Sprint } from "./Sprint";
import { DetalleParametro } from "./DetalleParametro";
import { Usuario } from "./Usuario";

@Index("spr_ID_FK", ["sprIdFk"], {})
@Index("det_par_ID_tipo_FK", ["detParIdTipoFk"], {})
@Index("det_par_ID_estado_FK", ["detParIdEstadoFk"], {})
@Index("reu_cedula_FK", ["reuResponsableFk"], {})
@Entity("reuniones", { schema: "pro_scrum" })
export class Reuniones {
  @PrimaryGeneratedColumn({ type: "int", name: "reu_ID" })
  reuId: number;

  @Column("int", { name: "spr_ID_FK" })
  sprIdFk: number;

  @Column("int", {
    name: "det_par_ID_tipo_FK",
    comment: "Tipo de reunión (ID 10-13)",
  })
  detParIdTipoFk: number;

  @Column("int", {
    name: "det_par_ID_estado_FK",
    nullable: true,
    comment: "Estado de la reunión",
  })
  detParIdEstadoFk: number | null;

  @Column("date", { name: "reu_fecha" })
  reuFecha: string;

  @Column("text", { name: "reu_descripcion", nullable: true })
  reuDescripcion: string | null;

  @Column("varchar", { name: "reu_lugar", nullable: true, length: 255 })
  reuLugar: string | null;

  @Column("time", { name: "reu_hora", nullable: true })
  reuHora: string | null;

  @Column("text", { name: "reu_resumen", nullable: true })
  reuResumen: string | null;

  @Column("text", { name: "reu_informe", nullable: true })
  reuInforme: string | null;

  @Column("bigint", {
    name: "reu_cedula_FK",
    nullable: true,
    comment: "Responsable que creó la reunión",
  })
  reuResponsableFk: number | null;

  @ManyToOne(() => Sprint, (sprint) => sprint.reuniones, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "spr_ID_FK", referencedColumnName: "sprId" }])
  sprIdFk2: Sprint;

  @ManyToOne(
    () => DetalleParametro,
    (detalleParametro) => detalleParametro.reuniones,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([
    { name: "det_par_ID_tipo_FK", referencedColumnName: "detParId" },
  ])
  detParIdTipoFk2: DetalleParametro;

  @ManyToOne(() => DetalleParametro, {
    nullable: true,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([
    { name: "det_par_ID_estado_FK", referencedColumnName: "detParId" },
  ])
  detParIdEstadoFk2: DetalleParametro | null;

  @ManyToOne(() => Usuario, {
    nullable: true,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "reu_cedula_FK", referencedColumnName: "usuCedula" }])
  reuResponsableFk2: Usuario | null;
}