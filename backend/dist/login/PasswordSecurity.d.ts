export declare const PASSWORD_POLICY: {
    readonly minLength: 8;
    readonly requireLowercase: true;
    readonly requireUppercase: true;
    readonly requireNumber: true;
    readonly requireSpecial: true;
};
export declare const PASSWORD_POLICY_HINTS: readonly ["Minimo 8 caracteres.", "Al menos una letra mayuscula.", "Al menos una letra minuscula.", "Al menos un numero.", "Al menos un caracter especial."];
export declare function hashPassword(password: string): Promise<string>;
export declare function compareWithStoredPassword(plainPassword: string, storedPassword: string | null | undefined): Promise<boolean>;
export declare function validatePasswordPolicy(password: string): {
    isValid: boolean;
    errors: string[];
};
