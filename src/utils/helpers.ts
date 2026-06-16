/**
 * Generates a unique registration number with the format: REG-YYYYMMDD-XXXX
 * Where YYYYMMDD is the current date and XXXX is a 4-digit alphanumeric code.
 */
export const generateRegistrationNumber = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `REG-${dateStr}-${randomStr}`;
};
