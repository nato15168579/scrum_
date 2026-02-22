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
  // Cambiado a @Column primary para poder asignar el ID manualmente desde el código
  @Column("int", { primary: true, name: "pro_ID", comment: "id del proyecto" })
  proId: number;

  @Column("varchar", { name: "pro_nombre", nullable: true, length: 100 })
  proNombre: string | null;

  @Column("varchar", { name: "pro_objetivo_general", nullable: true, length: 255 })
  proObjetivoGeneral: string | null;

  @Column("varchar", { name: "por_objetivos_especificos", nullable: true, length: 255 })
  porObjetivosEspecificos: string | null;

  @Column("varchar", { name: "pro_descripcion", nullable: true, length: 200 })
  proDescription: string | null;

  @Column("date", { name: "pro_fecha_inicio", nullable: true })
  proFechaInicio: string | null;

  @Column("date", { name: "pro_fecha_fin", nullable: true })
  proFechaFin: string | null;

  @Column("varchar", { name: "pro_duracion_sprint", nullable: true, length: 50 })
  proDuracionSprint: string | null;

  @Column("varchar", { name: "pro_justificacion", nullable: true, length: 255 })
  proJustificacion: string | null;

  @Column("int", { name: "det_par_ID_FK", nullable: true })
  detParIdFk: number | null;

  // Relaciones (Se mantienen igual)
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