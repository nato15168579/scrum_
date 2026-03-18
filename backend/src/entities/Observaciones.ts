/**
 * Observaciones entity
 * -------------------
 * Mapeo TypeORM de la tabla `observaciones`.
 *
 * En el contexto del panel administrador, se usa como "sugerencias" del proyecto.
 * Guarda descripcion, fecha, responsable (usuario) y estado.
 */
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuario } from "./Usuario";
import { Proyecto } from "./Proyecto";
import { DetalleParametro } from "./DetalleParametro";

@Index("usu_fk", ["usuCedulaFk"], {})
@Index("pro_ID_FK", ["proIdFk"], {})
@Index("obs_estado_FK", ["obsEstadoFk"], {})
@Entity("observaciones", { schema: "pro_scrum" })
export class Observaciones {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "obs_ID",
    comment: "id de la observacion",
  })
  obsId: number;

  @Column("date", {
    name: "obs_fecha",
    nullable: true,
    comment: "fecha de la  observacion",
  })
  obsFecha: string | null;

  @Column("int", {
    name: "obs_estado_FK",
    nullable: true,
    comment:
      "especifique en que estado se estado est ala observacion (por hacer, en progreso, hecho)",
  })
  obsEstadoFk: number | null;

  @Column("varchar", {
    name: "obs_descripcion",
    nullable: true,
    comment: "descripcion de la  observacion",
    length: 255,
  })
  obsDescripcion: string | null;

  @Column("bigint", { name: "usu_cedula_FK", nullable: true })
  usuCedulaFk: number | null;

  @Column("int", { name: "pro_ID_FK", nullable: true })
  proIdFk: number | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.observaciones, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "usu_cedula_FK", referencedColumnName: "usuCedula" }])
  usuCedulaFk2: Usuario;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.observaciones, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "pro_ID_FK", referencedColumnName: "proId" }])
  proIdFk2: Proyecto;

  @ManyToOne(
    () => DetalleParametro,
    (detalleParametro) => detalleParametro.observaciones,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "obs_estado_FK", referencedColumnName: "detParId" }])
  obsEstadoFk2: DetalleParametro;
}
