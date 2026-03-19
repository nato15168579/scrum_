/**
 * DetalleParametro entity
 * ----------------------
 * Mapeo TypeORM de la tabla `detalle_parametro`.
 *
 * Se usa como catalogo para:
 * - Estados (por hacer, en progreso, hecho, etc.)
 * - Roles Scrum (product owner, scrum master, scrum team)
 * - Otros parametros del sistema.
 */
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { Parametro } from "./Parametro";
import { HistoriaUsuario } from "./HistoriaUsuario";
import { Observaciones } from "./Observaciones";
import { Proyecto } from "./Proyecto";
import { Reuniones } from "./Reuniones";
import { RolSistema } from "./RolSistema";
import { UsuProDetPar } from "./UsuProDetPar";

@Index("par_ID_FK", ["parIdFk"], {})
@Entity("detalle_parametro", { schema: "pro_scrum" })
export class DetalleParametro {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "det_par_ID",
    comment: "id del detalle parametro",
  })
  detParId: number;

  @Column("varchar", {
    name: "det_par_descripcion",
    nullable: true,
    comment: "descripcion del detalle parametro",
    length: 500,
  })
  detParDescripcion: string | null;

  @Column("int", {
    name: "par_ID_FK",
    nullable: true,
    comment: "id del parametro",
  })
  parIdFk: number | null;

  @OneToMany(
    () => CriteriosAceptacion,
    (criteriosAceptacion) => criteriosAceptacion.detParIdFk2
  )
  criteriosAceptacions: CriteriosAceptacion[];

  @ManyToOne(() => Parametro, (parametro) => parametro.detalleParametros, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "par_ID_FK", referencedColumnName: "parId" }])
  parIdFk2: Parametro;

  @OneToMany(
    () => HistoriaUsuario,
    (historiaUsuario) => historiaUsuario.detParIdFk2
  )
  historiaUsuarios: HistoriaUsuario[];

  @OneToMany(() => Observaciones, (observaciones) => observaciones.detParIdFk2)
  observaciones: Observaciones[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.detParIdFk2)
  proyectos: Proyecto[];

  @OneToMany(() => Reuniones, (reuniones) => reuniones.detParIdTipoFk2)
  reuniones: Reuniones[];

  @ManyToMany(() => RolSistema, (rolSistema) => rolSistema.detalleParametros)
  rolSistemas: RolSistema[];

  @OneToMany(() => UsuProDetPar, (usuProDetPar) => usuProDetPar.detParId_2)
  usuProDetPars: UsuProDetPar[];
}
