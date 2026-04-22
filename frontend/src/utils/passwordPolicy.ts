export const PASSWORD_POLICY = {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
} as const;

export const PASSWORD_POLICY_HINTS = [
  'Minimo 8 caracteres',
  'Una letra mayuscula',
  'Una letra minuscula',
  'Un numero',
  'Un caracter especial',
] as const;

const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const numberRegex = /\d/;
const specialRegex = /[^A-Za-z0-9]/;

export function getPasswordPolicyChecks(password: string) {
  const normalizedPassword = String(password || '');

  return [
    {
      id: 'min-length',
      label: `Minimo ${PASSWORD_POLICY.minLength} caracteres`,
      valid: normalizedPassword.length >= PASSWORD_POLICY.minLength,
    },
    {
      id: 'uppercase',
      label: 'Al menos una mayuscula',
      valid: uppercaseRegex.test(normalizedPassword),
    },
    {
      id: 'lowercase',
      label: 'Al menos una minuscula',
      valid: lowercaseRegex.test(normalizedPassword),
    },
    {
      id: 'number',
      label: 'Al menos un numero',
      valid: numberRegex.test(normalizedPassword),
    },
    {
      id: 'special',
      label: 'Al menos un caracter especial',
      valid: specialRegex.test(normalizedPassword),
    },
  ] as const;
}

export function validatePasswordPolicy(password: string) {
  const errors = getPasswordPolicyChecks(password)
    .filter((rule) => !rule.valid)
    .map((rule) => rule.label);

  return {
    isValid: errors.length === 0,
    errors,
  };
}
