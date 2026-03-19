/**
 * Reuniones entity
 * ---------------
 * Mapeo TypeORM de la tabla `reuniones`.
 *
 * Representa reuniones asociadas a un sprint, con un tipo (detalle_parametro).
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

@Index("spr_ID_FK", ["sprIdFk"], {})
@Index("det_par_ID_tipo_FK", ["detParIdTipoFk"], {})
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

  @Column("date", { name: "reu_fecha" })
  reuFecha: string;

  @Column("text", { name: "reu_descripcion", nullable: true })
  reuDescripcion: string | null;

  @Column("varchar", { name: "reu_lugar", nullable: true, length: 255 })
  reuLugar: string | null;

  @Column("time", { name: "reu_hora", nullable: true })
  reuHora: string | null;

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
}
