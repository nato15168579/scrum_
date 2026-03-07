import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { Observaciones } from "./Observaciones";
import { RolSistema } from "./RolSistema";
import { Reuniones } from "./Reuniones";
import { UsuProDetPar } from "./UsuProDetPar";

export type EstadoUsuario = "Activo" | "Inactivo";
export type SexoUsuario = "Hombre" | "Mujer";

@Index("RolID", ["rolSisIdFk"], {})
@Entity("usuario", { schema: "pro_scrum" })
export class Usuario {
  @Column("int", {
    primary: true,
    name: "usu_cedula",
    comment: "cedula del usuario",
  })
  usuCedula: number;

  @Column("varchar", {
    name: "usu_tipodedocumento",
    nullable: true,
    length: 20,
    default: () => "'CC'",
  })
  usuTipoDocumento: string | null;

  @Column("varchar", {
    name: "usu_nombres",
    nullable: true,
    comment: "nombre del usuario",
    length: 100,
  })
  usuNombres: string | null;

  @Column("varchar", {
    name: "usu_apellidos",
    nullable: true,
    comment: "apellido del usuario",
    length: 100,
  })
  usuApellidos: string | null;

  @Column("varchar", {
    name: "usu_correo",
    nullable: true,
    comment: "correo del usuario",
    length: 100,
  })
  usuCorreo: string | null;

  @Column("varchar", {
    name: "usu_telefono",
    nullable: true,
    comment: "telefono del usuario",
    length: 20,
  })
  usuTelefono: string | null;

  @Column("varchar", {
    name: "usu_especializacion",
    nullable: true,
    comment: "especializacion del instructor",
    length: 120,
  })
  usuEspecializacion: string | null;

  @Column("enum", {
    name: "usu_sexo",
    nullable: true,
    enum: ["Hombre", "Mujer"],
    comment: "sexo del aprendiz",
  })
  usuSexo: SexoUsuario | null;

  @Column("varchar", {
    name: "usu_contraseña",
    nullable: true,
    comment: "contrasena del usuario",
    length: 250,
  })
  usuContrasena: string | null;

  @Column("datetime", {
    name: "fecha_registro",
    default: () => "CURRENT_TIMESTAMP",
    comment: "fecha de registro del usuario",
  })
  fechaRegistro: Date;

  @Column("int", { name: "rol_sis_ID_FK", nullable: true })
  rolSisIdFk: number | null;

  @Column("varchar", {
    name: "usu_estado",
    nullable: true,
    comment: "estado del usuario (Activo o Inactivo)",
    length: 10,
    default: () => "'Activo'",
  })
  usuEstado: EstadoUsuario | null;

  @OneToMany(
    () => CriteriosAceptacion,
    (criteriosAceptacion) => criteriosAceptacion.usuCedulaFk2,
  )
  criteriosAceptacions: CriteriosAceptacion[];

  @OneToMany(
    () => Observaciones,
    (observaciones) => observaciones.usuCedulaFk2,
  )
  observaciones: Observaciones[];

  @ManyToOne(() => RolSistema, (rolSistema) => rolSistema.usuarios, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "rol_sis_ID_FK", referencedColumnName: "rolSisId" }])
  rolSisIdFk2: RolSistema;

  @ManyToMany(() => Reuniones, (reuniones) => reuniones.usuarios)
  @JoinTable({
    name: "usu_asis",
    joinColumns: [{ name: "usu_cedula", referencedColumnName: "usuCedula" }],
    inverseJoinColumns: [
      { name: "reu_asistente_FK", referencedColumnName: "reuAsistentesFk" },
    ],
    schema: "pro_scrum",
  })
  reuniones: Reuniones[];

  @OneToMany(() => UsuProDetPar, (usuProDetPar) => usuProDetPar.usuCedula2)
  usuProDetPars: UsuProDetPar[];
}
