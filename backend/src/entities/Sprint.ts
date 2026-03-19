/**
 * Sprint entity
 * ------------
 * Mapeo TypeORM de la tabla `sprint`.
 *
 * Representa iteraciones (sprints) con fechas y una relacion 1:N con reuniones.
 */
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { DetalleParametro } from "./DetalleParametro";
import { Reuniones } from "./Reuniones";

@Index("spr_ID", ["sprId"], {})
@Index("det_par_FK", ["detParFk"], {})
@Entity("sprint", { schema: "pro_scrum" })
export class Sprint {
  @PrimaryColumn("int", { name: "spr_ID", comment: "id del sprint" })
  sprId: number;

  @Column("varchar", {
    name: "spr_nombre",
    nullable: true,
    comment: "nombre del sprint",
    length: 100,
  })
  sprNombre: string | null;

  @Column("date", {
    name: "spr_fecha_inicio",
    nullable: true,
    comment: "fecha de inicio del sprint",
  })
  sprFechaInicio: string | null;

  @Column("date", {
    name: "spr_fecha_fin",
    nullable: true,
    comment: "fecha fin del sprint",
  })
  sprFechaFin: string | null;

  @Column("varchar", {
    name: "spr_descripcion",
    nullable: true,
    comment: "descripcion del sprint",
    length: 500,
  })
  sprDescripcion: string | null;

  @Column("int", { name: "det_par_FK", nullable: true })
  detParFk: number | null;

  @OneToMany(() => Reuniones, (reuniones) => reuniones.sprIdFk2)
  reuniones: Reuniones[];

  @ManyToOne(() => DetalleParametro, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "det_par_FK", referencedColumnName: "detParId" }])
  detParFk2: DetalleParametro;
}
