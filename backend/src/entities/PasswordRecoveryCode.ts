import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './Usuario';

@Index('uq_password_recovery_codes_recovery_id', ['recoveryId'], { unique: true })
@Index('idx_password_recovery_codes_user', ['usuCedulaFk'], {})
@Index('idx_password_recovery_codes_expires', ['expiresAt'], {})
@Entity('password_recovery_codes', { schema: 'pro_scrum' })
export class PasswordRecoveryCode {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'prc_id' })
  prcId: number;

  @Column('varchar', {
    name: 'recovery_id',
    length: 64,
  })
  recoveryId: string;

  @Column('bigint', {
    name: 'usu_cedula_fk',
  })
  usuCedulaFk: number;

  @Column('varchar', {
    name: 'usu_correo',
    length: 100,
  })
  usuCorreo: string;

  @Column('varchar', {
    name: 'code_hash',
    length: 255,
  })
  codeHash: string;

  @Column('varchar', {
    name: 'reset_token_hash',
    length: 64,
    nullable: true,
  })
  resetTokenHash: string | null;

  @Column('int', {
    name: 'attempt_count',
    default: () => '0',
  })
  attemptCount: number;

  @Column('int', {
    name: 'max_attempts',
    default: () => '5',
  })
  maxAttempts: number;

  @Column('datetime', {
    name: 'requested_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  requestedAt: Date;

  @Column('datetime', {
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column('datetime', {
    name: 'last_attempt_at',
    nullable: true,
  })
  lastAttemptAt: Date | null;

  @Column('datetime', {
    name: 'verified_at',
    nullable: true,
  })
  verifiedAt: Date | null;

  @Column('datetime', {
    name: 'reset_token_expires_at',
    nullable: true,
  })
  resetTokenExpiresAt: Date | null;

  @Column('datetime', {
    name: 'consumed_at',
    nullable: true,
  })
  consumedAt: Date | null;

  @Column('datetime', {
    name: 'invalidated_at',
    nullable: true,
  })
  invalidatedAt: Date | null;

  @ManyToOne(() => Usuario, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'usu_cedula_fk', referencedColumnName: 'usuCedula' }])
  usuario: Usuario;
}
