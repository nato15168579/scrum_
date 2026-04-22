import * as bcrypt from 'bcrypt';

export const PASSWORD_POLICY = {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
} as const;

export const PASSWORD_POLICY_HINTS = [
  'Minimo 8 caracteres.',
  'Al menos una letra mayuscula.',
  'Al menos una letra minuscula.',
  'Al menos un numero.',
  'Al menos un caracter especial.',
] as const;

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /\d/;
const SPECIAL_REGEX = /[^A-Za-z0-9]/;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function compareWithStoredPassword(
  plainPassword: string,
  storedPassword: string | null | undefined,
) {
  const normalizedStoredPassword = String(storedPassword || '').trim();
  if (!normalizedStoredPassword) {
    return false;
  }

  if (normalizedStoredPassword.startsWith('$2')) {
    return bcrypt.compare(plainPassword, normalizedStoredPassword);
  }

  return plainPassword === normalizedStoredPassword;
}

export function validatePasswordPolicy(password: string) {
  const normalizedPassword = String(password || '');
  const errors: string[] = [];

  if (normalizedPassword.length < PASSWORD_POLICY.minLength) {
    errors.push(
      `La contrasena debe tener minimo ${PASSWORD_POLICY.minLength} caracteres.`,
    );
  }

  if (PASSWORD_POLICY.requireUppercase && !UPPERCASE_REGEX.test(normalizedPassword)) {
    errors.push('La contrasena debe incluir al menos una letra mayuscula.');
  }

  if (PASSWORD_POLICY.requireLowercase && !LOWERCASE_REGEX.test(normalizedPassword)) {
    errors.push('La contrasena debe incluir al menos una letra minuscula.');
  }

  if (PASSWORD_POLICY.requireNumber && !NUMBER_REGEX.test(normalizedPassword)) {
    errors.push('La contrasena debe incluir al menos un numero.');
  }

  if (PASSWORD_POLICY.requireSpecial && !SPECIAL_REGEX.test(normalizedPassword)) {
    errors.push('La contrasena debe incluir al menos un caracter especial.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
