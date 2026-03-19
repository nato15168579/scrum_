/**
 * HistoriaUsuario entity
 * ---------------------
 * Mapeo TypeORM de la tabla `historia_usuario`.
 *
 * Representa una historia de usuario asociada a un proyecto. Normalmente es la entidad
 * "padre" de criterios de aceptacion (`criterios_aceptacion`).
 */
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { DetalleParametro } from "./DetalleParametro";
import { Proyecto } from "./Proyecto";
import { Sprint } from "./Sprint";
import { Usuario } from "./Usuario";

@Index("pro_ID_FK", ["proIdFk"], {})
@Index("fk_hu_estado", ["detParIdFk"], {})
@Index("usu_cedula_FK", ["usuCedulaFk"], {})
@Index("sprint_id_FK", ["sprintIdFk"], {})
@Entity("historia_usuario", { schema: "pro_scrum" })
export class HistoriaUsuario {
  @Column("int", {
    primary: true,
    name: "his_ID",
    comment: "id de la historia de usuario",
  })
  hisId: number;

  @Column("int", { primary: true, name: "pro_ID_FK" })
  proIdFk: number;

  @Column("varchar", {
    name: "his_titulo",
    nullable: true,
    comment: "titulo de la historia de usuario",
    length: 255,
  })
  hisTitulo: string | null;

  @Column("varchar", {
    name: "his_descripcion",
    nullable: true,
    comment: "prioridada de la historia de usuario",
    length: 500,
  })
  hisDescripcion: string | null;

  @Column("int", {
    name: "his_puntaje",
    nullable: true,
    comment: "puntaje de la historia de usuario",
  })
  hisPuntaje: number | null;

  @Column("int", {
    name: "det_par_ID_FK",
    nullable: true,
    comment: "Estado de la HU (To Do, Doing, Done)",
  })
  detParIdFk: number | null;

  @Column("bigint", { name: "usu_cedula_FK", nullable: true })
  usuCedulaFk: number | null;

  @Column("int", { name: "sprint_id_FK", nullable: true })
  sprintIdFk: number | null;

  @OneToMany(
    () => CriteriosAceptacion,
    (criteriosAceptacion) => criteriosAceptacion.historiaUsuario
  )
  criteriosAceptacions: CriteriosAceptacion[];

  @ManyToOne(
    () => DetalleParametro,
    (detalleParametro) => detalleParametro.historiaUsuarios,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([
    { name: "det_par_ID_FK", referencedColumnName: "detParId" },
  ])
  detParIdFk2: DetalleParametro;

  @ManyToOne(() => Usuario, { onDelete: "RESTRICT", onUpdate: "RESTRICT" })
  @JoinColumn([{ name: "usu_cedula_FK", referencedColumnName: "usuCedula" }])
  usuCedulaFk2: Usuario;

  @ManyToOne(() => Sprint, { onDelete: "RESTRICT", onUpdate: "RESTRICT" })
  @JoinColumn([{ name: "sprint_id_FK", referencedColumnName: "sprId" }])
  sprintIdFk2: Sprint;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.historiaUsuarios, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "pro_ID_FK", referencedColumnName: "proId" }])
  proIdFk2: Proyecto;
}
