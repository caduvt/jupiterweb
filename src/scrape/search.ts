import { fetchPage } from "../lib/fetch.js";
import { getDisciplineUrl, getSearchUrl } from "../lib/urls.js";
import { parseSearchResults } from "../parse/search.js";
import { parseMainPage } from "../parse/main.js";
import type {
  SearchResults,
  SearchOptions,
  DisciplineData,
} from "../types/index.js";

/**
 * Normalize accented characters the same way Jupiterweb does.
 */
function normalizeQuery(query: string): string {
  let result = query;
  result = result.replace(/[ÁÀÂÃ]/gi, "A");
  result = result.replace(/[ÉÈÊ]/gi, "E");
  result = result.replace(/[ÍÌÎ]/gi, "I");
  result = result.replace(/[ÓÒÔÕ]/gi, "O");
  result = result.replace(/[ÚÙÛ]/gi, "U");
  result = result.replace(/[Ç]/gi, "C");
  return result.toLowerCase();
}

/**
 * Search for disciplines by name.
 *
 * @param query - Search term (e.g. "calculo", "cálculo")
 * @param options - Optional settings
 * @param options.full - If true, fetches the institute name for each hit (extra HTTP requests)
 *
 * Returns `tooMany: true` when Jupiterweb returns more results than it can
 * display. In that case the caller should ask the user to refine the query.
 */
export async function searchDisciplines(
  query: string,
  options?: SearchOptions,
): Promise<SearchResults> {
  const normalized = normalizeQuery(query);
  const $ = await fetchPage(getSearchUrl(normalized));
  const results = parseSearchResults($);

  if (options?.full && !results.tooMany) {
    const institutes = await fetchInstitutes(results.hits.map((h) => h.code));
    results.hits = results.hits.map((hit) => ({
      ...hit,
      institute: institutes.get(hit.code) ?? "",
    }));
  }

  return results;
}

/**
 * Fetch full discipline data by exact code.
 */
export async function searchByCode(code: string): Promise<DisciplineData> {
  const upperCode = code.toUpperCase();
  const $ = await fetchPage(getDisciplineUrl(upperCode));
  const main = parseMainPage($);

  return {
    code: upperCode,
    institute: main.institute,
    department: main.department,
    name: main.name,
    englishName: main.englishName,
    requirements: {},
    idealPeriod: {},
    offerings: [],
    sections: main.sections,
  };
}

async function fetchInstitutes(codes: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const concurrency = 5;
  for (let i = 0; i < codes.length; i += concurrency) {
    const batch = codes.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (code) => {
        const $ = await fetchPage(getDisciplineUrl(code));
        const main = parseMainPage($);
        map.set(code, main.institute);
      }),
    );
  }
  return map;
}
