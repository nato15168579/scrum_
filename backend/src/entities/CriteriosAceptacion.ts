/**
 * CriteriosAceptacion entity
 * -------------------------
 * Mapeo TypeORM de la tabla `criterios_aceptacion`.
 *
 * En este esquema, el criterio pertenece a un proyecto (`pro_ID_FK`) y opcionalmente
 * referencia una historia (`his_id_FK`). La PK es compuesta (cri_ID, pro_ID_FK).
 */
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { DetalleParametro } from "./DetalleParametro";
import { HistoriaUsuario } from "./HistoriaUsuario";

@Index("usu_cedula_FK", ["usuCedulaFk"], {})
@Index("cri_ID", ["criId"], {})
@Index("estado_FK", ["detParIdFk"], {})
@Index("fk_criterios_historia_final", ["hisIdFk", "proIdFk"], {})
@Entity("criterios_aceptacion", { schema: "pro_scrum" })
export class CriteriosAceptacion {
  @Column("int", {
    primary: true,
    name: "cri_ID",
    comment: "id de criterio de aceptacion",
  })
  criId: number;

  @Column("int", {
    primary: true,
    name: "pro_ID_FK",
    comment: "id del proyecto",
  })
  proIdFk: number;

  @Column("bigint", {
    name: "usu_cedula_FK",
    nullable: false,
    comment: "cedula del usuario",
  })
  usuCedulaFk: number;

  @Column("int", {
    name: "det_par_id_FK",
    nullable: false,
    comment: "Estado del criterio (pendiente, en proceso, finalizado)",
  })
  detParIdFk: number;

  @Column("int", { name: "his_id_FK", nullable: true })
  hisIdFk: number | null;

  @Column("varchar", {
    name: "cri_tiempo",
    nullable: true,
    comment: "defina cuanto tiempo en horas va a ejercer cada criterio",
    length: 50,
  })
  criTiempo: string | null;

  @Column("varchar", {
    name: "cri_descripcion",
    nullable: true,
    comment: "descripcion del criterio de aceptacion",
    length: 500,
  })
  criDescripcion: string | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.criteriosAceptacions, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "usu_cedula_FK", referencedColumnName: "usuCedula" }])
  usuCedulaFk2: Usuario;

  @ManyToOne(
    () => DetalleParametro,
    (detalleParametro) => detalleParametro.criteriosAceptacions,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "det_par_id_FK", referencedColumnName: "detParId" }])
  detParIdFk2: DetalleParametro;

  @ManyToOne(
    () => HistoriaUsuario,
    (historiaUsuario) => historiaUsuario.criteriosAceptacions,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([
    { name: "his_id_FK", referencedColumnName: "hisId" },
    { name: "pro_ID_FK", referencedColumnName: "proIdFk" },
  ])
  historiaUsuario: HistoriaUsuario;
}
