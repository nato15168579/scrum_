import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Ficha } from "./Ficha";
// El import de Usuario déjalo si lo usas para el tipo de dato, 
// pero en el decorador usaremos el nombre como texto.

@Entity("usu_fic", { schema: "pro_scrum" })
export class UsuFic {
  @PrimaryGeneratedColumn({ type: "int", name: "usu_fic_ID" })
  usuFicId: number;

  @Column("bigint", { name: "usu_cedula_FK" })
  usuCedulaFk: number;

  @Column("int", { name: "fic_ID_FK" })
  ficIdFk: number;

  @Column("varchar", { name: "usu_fic_estado", length: 10, default: "Activo" })
  usuFicEstado: string;

  // CAMBIO CLAVE: Usamos 'Usuario' (string) en lugar de () => Usuario
  @ManyToOne('Usuario') 
  @JoinColumn([{ name: "usu_cedula_FK", referencedColumnName: "usuCedula" }])
  usuario: any; 

  @ManyToOne(() => Ficha, (ficha) => ficha.usuFics)
  @JoinColumn([{ name: "fic_ID_FK", referencedColumnName: "ficId" }])
  ficha: Ficha;
}