/**
 * RolSistema entity
 * ----------------
 * Mapeo TypeORM de la tabla `rol_sistema`.
 *
 * Define roles del sistema (ej: administrador, instructor, aprendiz) y su relacion
 * con permisos/parametros via `rol_sis_det_par`.
 */
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { DetalleParametro } from "./DetalleParametro";
import { Usuario } from "./Usuario";

@Entity("rol_sistema", { schema: "pro_scrum" })
export class RolSistema {
  @Column("int", {
    primary: true,
    name: "rol_sis_ID",
    comment: "id del rol de sistema",
  })
  rolSisId: number;

  @Column("varchar", {
    name: "rol_nombre",
    nullable: true,
    comment: "nombre del rol de sistema",
    length: 100,
  })
  rolNombre: string | null;

  @ManyToMany(
    () => DetalleParametro,
    (detalleParametro) => detalleParametro.rolSistemas
  )
  @JoinTable({
    name: "rol_sis_det_par",
    joinColumns: [{ name: "rol_sis_ID", referencedColumnName: "rolSisId" }],
    inverseJoinColumns: [
      { name: "det_par_ID", referencedColumnName: "detParId" },
    ],
    schema: "pro_scrum",
  })
  detalleParametros: DetalleParametro[];

  @OneToMany(() => Usuario, (usuario) => usuario.rolSisIdFk2)
  usuarios: Usuario[];
}
