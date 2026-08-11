export function normalizeTitle(title: string): string {
  let result = title.trim().replace(/:$/, "");
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  result = result.toLowerCase();
  result = result.replace(/ +/g, " ");
  return result;
}
