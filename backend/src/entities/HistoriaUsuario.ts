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

@Index("pro_ID_FK", ["proIdFk"], {})
@Index("fk_hu_estado", ["detParIdEstadoFk"], {})
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

  @Column("varchar", {
    name: "his_prioridad",
    nullable: true,
    comment: "numero de sprint de historia de usuario",
    length: 50,
  })
  hisPrioridad: string | null;

  @Column("int", {
    name: "his_puntaje",
    nullable: true,
    comment: "puntaje de la historia de usuario",
  })
  hisPuntaje: number | null;

  @Column("int", { name: "his_numero_sprint", nullable: true })
  hisNumeroSprint: number | null;

  @Column("int", {
    name: "det_par_ID_estado_FK",
    nullable: true,
    comment: "Estado de la HU (To Do, Doing, Done)",
  })
  detParIdEstadoFk: number | null;

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
    { name: "det_par_ID_estado_FK", referencedColumnName: "detParId" },
  ])
  detParIdEstadoFk2: DetalleParametro;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.historiaUsuarios, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "pro_ID_FK", referencedColumnName: "proId" }])
  proIdFk2: Proyecto;
}
