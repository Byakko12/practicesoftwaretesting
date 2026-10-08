/** Convierte textos como "$14.15" a número. */
export function parseMoney(text: string): number {
  const value = Number.parseFloat(text.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(value)) throw new Error(`No se pudo convertir "${text}" a número`);
  return value;
}
