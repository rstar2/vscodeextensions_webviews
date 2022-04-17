const NONCE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const NONCE_LENGTH = 32;

/**
 * Generate a valid nonce string
 * @returns always valid
 */
export function getNonce() {
  let text = "";
  for (let i = 0; i < NONCE_LENGTH; i++) {
    text += NONCE_CHARS.charAt(Math.floor(Math.random() * NONCE_CHARS.length));
  }
  return text;
}
