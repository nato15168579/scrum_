/**
 * UsuProDetPar entity
 * ------------------
 * Mapeo TypeORM de la tabla `usu_pro_det_par`.
 *
 * Esta tabla relaciona:
 * - Usuario (cedula)
 * - Proyecto (pro_ID)
 * - Detalle parametro (det_par_ID_FK), usado como rol Scrum.
 */
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { DetalleParametro } from "./DetalleParametro";
import { Proyecto } from "./Proyecto";

@Index("CedulaUsuario", ["detParId"], {})
@Index("RolScrumID", ["proId"], {})
@Entity("usu_pro_det_par", { schema: "pro_scrum" })
export class UsuProDetPar {
  @Column("bigint", {
    primary: true,
    name: "usu_cedula",
    comment: "cedula del usuario",
  })
  usuCedula: number;

  @Column("int", {
    primary: true,
    name: "det_par_ID_FK",
    comment: "id del detalle parametro",
  })
  detParId: number;

  @Column("int", { primary: true, name: "pro_ID", comment: "id del proyecto" })
  proId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuProDetPars, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "usu_cedula", referencedColumnName: "usuCedula" }])
  usuCedula2: Usuario;

  @ManyToOne(
    () => DetalleParametro,
    (detalleParametro) => detalleParametro.usuProDetPars,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "det_par_ID_FK", referencedColumnName: "detParId" }])
  detParId_2: DetalleParametro;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.usuProDetPars, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "pro_ID", referencedColumnName: "proId" }])
  pro: Proyecto;
}
