import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn, 
} from "typeorm";
import { Reuniones } from "./Reuniones";
import { Proyecto } from "./Proyecto";

@Index("pro_ID_FK", ["proIdFk"], {})
@Index("spr_ID", ["sprId"], {})
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
    name: "spr_estado",
    nullable: true,
    comment: "especifique en que estado se encuentra el sprint (por hacer, en progreso, hecho)",
    length: 50,
  })
  sprEstado: string | null;

  @Column("varchar", {
    name: "spr_descripcion",
    nullable: true,
    comment: "descripcion del sprint",
    length: 500,
  })
  sprDescripcion: string | null;

  @Column("int", { name: "pro_ID_FK", nullable: true })
  proIdFk: number | null;

  @OneToMany(() => Reuniones, (reuniones) => reuniones.sprIdFk2)
  reuniones: Reuniones[];

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.sprints, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "pro_ID_FK", referencedColumnName: "proId" }])
  proIdFk2: Proyecto;
}