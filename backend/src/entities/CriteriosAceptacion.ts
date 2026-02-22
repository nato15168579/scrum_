import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { DetalleParametro } from "./DetalleParametro";
import { HistoriaUsuario } from "./HistoriaUsuario";

@Index("usu_cedula_FK", ["usuCedulaFk"], {})
@Index("cri_ID", ["criId"], {})
@Index("estado_FK", ["estadoFk"], {})
@Index("his_ID_FK_2", ["hisIdFk", "proIdHisFk"], {})
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
    name: "his_ID_FK",
    comment: "id de la historia de usuario",
  })
  hisIdFk: number;

  @Column("int", {
    primary: true,
    name: "pro_ID_his_FK",
    comment: "id del proyecto",
  })
  proIdHisFk: number;

  @Column("int", {
    name: "usu_cedula_FK",
    nullable: true,
    comment: "cedula del usuario",
  })
  usuCedulaFk: number | null;

  @Column("int", {
    name: "estado_FK",
    nullable: true,
    comment: "Estado del criterio (pendiente, en proceso, finalizado)",
  })
  estadoFk: number | null;

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
  @JoinColumn([{ name: "estado_FK", referencedColumnName: "detParId" }])
  estadoFk2: DetalleParametro;

  @ManyToOne(
    () => HistoriaUsuario,
    (historiaUsuario) => historiaUsuario.criteriosAceptacions,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([
    { name: "his_ID_FK", referencedColumnName: "hisId" },
    { name: "pro_ID_his_FK", referencedColumnName: "proIdFk" },
  ])
  historiaUsuario: HistoriaUsuario;
}
