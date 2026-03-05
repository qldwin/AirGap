import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';
const IV_LENGTH = 12;
const KEY = process.env.ENCRYPTION_KEY || '';

// Longueur de clé fixe definie par aes-256-gcm
if (process.env.ENCRYPTION_KEY?.length !== 32) {
    throw new Error("🚨 Erreur Critique : ENCRYPTION_KEY doit faire 32 caractères.");
}

/**
 * Chiffre un texte avec Auth Tag
 */
export const encryptText = (text: string): string => {
    if (!text) return '';

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);

    let encrypted = cipher.update(text, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const tag = cipher.getAuthTag().toString(ENCODING);

    return `${iv.toString(ENCODING)}:${tag}:${encrypted}`;
};

/**
 * Déchiffre un texte avec vérification du Tag
 */
export const decryptText = (text: string): string => {
    if (!text?.includes(':')) return text;

    try {
        const parts = text.split(':');

        if (parts.length !== 3) return "Donnée corrompue";

        const [ivPart, tagPart, encryptedText] = parts;

        if (!ivPart || !tagPart || !encryptedText) return "Donnée corrompue";
        const iv = Buffer.from(ivPart, ENCODING);
        const tag = Buffer.from(tagPart, ENCODING);

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);

        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedText, ENCODING, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error("Erreur de déchiffrement réelle :", error);
        return "Donnée protégée";
    }
};