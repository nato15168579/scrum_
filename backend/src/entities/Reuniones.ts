/**
 * Reuniones entity
 * ---------------
 * Mapeo TypeORM de la tabla `reuniones`.
 *
 * Representa reuniones asociadas a un sprint, con un tipo (detalle_parametro) y una
 * relacion many-to-many con usuarios asistentes via tabla intermedia `usu_asis`.
 */
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Sprint } from "./Sprint";
import { DetalleParametro } from "./DetalleParametro";
import { Usuario } from "./Usuario";

@Index("spr_ID_FK", ["sprIdFk"], {})
@Index("det_par_ID_tipo_FK", ["detParIdTipoFk"], {})
@Index("reu_asistentes_FK", ["reuAsistentesFk"], {})
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

  @Column("text", { name: "reu_resumen", nullable: true })
  reuResumen: string | null;

  @Column("int", { name: "reu_asistentes_FK", nullable: true })
  reuAsistentesFk: number | null;

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

  @ManyToMany(() => Usuario, (usuario) => usuario.reuniones)
  usuarios: Usuario[];
}
