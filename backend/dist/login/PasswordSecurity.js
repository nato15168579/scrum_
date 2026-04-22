"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_POLICY_HINTS = exports.PASSWORD_POLICY = void 0;
exports.hashPassword = hashPassword;
exports.compareWithStoredPassword = compareWithStoredPassword;
exports.validatePasswordPolicy = validatePasswordPolicy;
const bcrypt = require("bcrypt");
exports.PASSWORD_POLICY = {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true,
};
exports.PASSWORD_POLICY_HINTS = [
    'Minimo 8 caracteres.',
    'Al menos una letra mayuscula.',
    'Al menos una letra minuscula.',
    'Al menos un numero.',
    'Al menos un caracter especial.',
];
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /\d/;
const SPECIAL_REGEX = /[^A-Za-z0-9]/;
async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
async function compareWithStoredPassword(plainPassword, storedPassword) {
    const normalizedStoredPassword = String(storedPassword || '').trim();
    if (!normalizedStoredPassword) {
        return false;
    }
    if (normalizedStoredPassword.startsWith('$2')) {
        return bcrypt.compare(plainPassword, normalizedStoredPassword);
    }
    return plainPassword === normalizedStoredPassword;
}
function validatePasswordPolicy(password) {
    const normalizedPassword = String(password || '');
    const errors = [];
    if (normalizedPassword.length < exports.PASSWORD_POLICY.minLength) {
        errors.push(`La contrasena debe tener minimo ${exports.PASSWORD_POLICY.minLength} caracteres.`);
    }
    if (exports.PASSWORD_POLICY.requireUppercase && !UPPERCASE_REGEX.test(normalizedPassword)) {
        errors.push('La contrasena debe incluir al menos una letra mayuscula.');
    }
    if (exports.PASSWORD_POLICY.requireLowercase && !LOWERCASE_REGEX.test(normalizedPassword)) {
        errors.push('La contrasena debe incluir al menos una letra minuscula.');
    }
    if (exports.PASSWORD_POLICY.requireNumber && !NUMBER_REGEX.test(normalizedPassword)) {
        errors.push('La contrasena debe incluir al menos un numero.');
    }
    if (exports.PASSWORD_POLICY.requireSpecial && !SPECIAL_REGEX.test(normalizedPassword)) {
        errors.push('La contrasena debe incluir al menos un caracter especial.');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=PasswordSecurity.js.map