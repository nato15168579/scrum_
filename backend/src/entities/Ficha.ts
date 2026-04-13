import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DetalleParametro } from "./DetalleParametro";
import { UsuFic } from "./UsuFic";

@Index("pro_gra_ID_FK", ["proGraIdFk"], {})
@Entity("ficha", { schema: "pro_scrum" })
export class Ficha {
  @PrimaryGeneratedColumn({ type: "int", name: "fic_ID" })
  ficId: number;

  @Column("bigint", { name: "fic_codigo" })
  ficCodigo: number;

  @Column("int", { name: "pro_gra_ID_FK" })
  proGraIdFk: number;

  @Column("varchar", { name: "fic_estado", length: 10, default: "Activo" })
  ficEstado: string;

  // RELACIÓN UNIDIRECCIONAL (Sin el segundo parámetro que causaba el error)
  @ManyToOne(() => DetalleParametro) 
  @JoinColumn([{ name: "pro_gra_ID_FK", referencedColumnName: "detParId" }])
  programa: DetalleParametro;

  @OneToMany(() => UsuFic, (usuFic) => usuFic.ficha)
  usuFics: UsuFic[];
}