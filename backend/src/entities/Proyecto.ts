import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { HistoriaUsuario } from "./HistoriaUsuario";
import { Observaciones } from "./Observaciones";
import { DetalleParametro } from "./DetalleParametro";
import { Sprint } from "./Sprint";
import { UsuProDetPar } from "./UsuProDetPar";

@Index("det_par_ID_FK", ["detParIdFk"], {})
@Entity("proyecto", { schema: "pro_scrum" })
export class Proyecto {
  @Column("int", { primary: true, name: "pro_ID", comment: "id del proyecto" })
  proId: number;

  @Column("varchar", {
    name: "pro_codigo",
    nullable: true,
    unique: true,
    length: 32,
    comment: "codigo unico del proyecto",
  })
  proCodigo: string | null;

  @Column("varchar", { name: "pro_nombre", nullable: true, length: 100 })
  proNombre: string | null;

  @Column("varchar", {
    name: "pro_objetivo_general",
    nullable: true,
    length: 500,
  })
  proObjetivoGeneral: string | null;

  @Column("varchar", {
    name: "pro_objetivos_especificos",
    nullable: true,
    length: 500,
  })
  proObjetivosEspecificos: string | null;

  @Column("varchar", { name: "pro_descripcion", nullable: true, length: 200 })
  proDescription: string | null;

  @Column("date", { name: "pro_fecha_inicio", nullable: true })
  proFechaInicio: string | null;

  @Column("date", { name: "pro_fecha_fin", nullable: true })
  proFechaFin: string | null;

  @Column("varchar", { name: "pro_justificacion", nullable: true, length: 500 })
  proJustificacion: string | null;

  @Column("int", { name: "det_par_ID_FK", nullable: true })
  detParIdFk: number | null;

  @OneToMany(() => HistoriaUsuario, (h) => h.proIdFk2)
  historiaUsuarios: HistoriaUsuario[];

  @OneToMany(() => Observaciones, (o) => o.proIdFk2)
  observaciones: Observaciones[];

  @ManyToOne(() => DetalleParametro, (dp) => dp.proyectos)
  @JoinColumn([{ name: "det_par_ID_FK", referencedColumnName: "detParId" }])
  detParIdFk2: DetalleParametro;

  @OneToMany(() => Sprint, (s) => s.proIdFk2)
  sprints: Sprint[];

  @OneToMany(() => UsuProDetPar, (u) => u.pro)
  usuProDetPars: UsuProDetPar[];
}
