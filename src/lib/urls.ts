const BASE_URL = "https://uspdigital.usp.br/jupiterweb/";

export function getListingsUrl(code: string): string {
  return `${BASE_URL}jupDisciplinaLista?codcg=${code}&letra=0-Z&tipo=D`;
}

export function getDisciplineUrl(code: string): string {
  return `${BASE_URL}obterDisciplina?sgldis=${code}`;
}

export function getOfferingUrl(code: string): string {
  return `${BASE_URL}obterTurma?sgldis=${code}`;
}

export function getRequirementsUrl(code: string): string {
  return `${BASE_URL}listarCursosRequisitos?coddis=${code}`;
}

export function getSearchUrl(query: string): string {
  return `${BASE_URL}obterDisciplina?nomdis=${query}&sgldis=`;
}
