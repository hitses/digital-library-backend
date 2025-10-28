export const capitalizeWords = (text: string): string =>
  text
    // toLocaleLowerCase('es-ES') → pasa todo a minúsculas respetando acentos
    .toLocaleLowerCase('es-ES')
    // La expresión /(^|\s)\p{L}/gu busca cada letra (\p{L}) que aparece al inicio o después de un espacio.
    // toLocaleUpperCase('es-ES') convierte la letra a mayúscula respetando las reglas del idioma.
    .replace(/(^|\s)\p{L}/gu, (match) => match.toLocaleUpperCase('es-ES'));
