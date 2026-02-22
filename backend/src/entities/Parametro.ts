import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DetalleParametro } from "./DetalleParametro";

@Entity("parametro", { schema: "pro_scrum" })
export class Parametro {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "par_ID",
    comment: "id del parametro",
  })
  parId: number;

  @Column("varchar", {
    name: "par_descripcion",
    nullable: true,
    comment: "descripcion del parametro",
    length: 500,
  })
  parDescripcion: string | null;

  @OneToMany(
    () => DetalleParametro,
    (detalleParametro) => detalleParametro.parIdFk2
  )
  detalleParametros: DetalleParametro[];
}
