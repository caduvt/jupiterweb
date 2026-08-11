import institutionsData from "../data/institutions.json" with { type: "json" };
import { fetchPage } from "../lib/fetch.js";
import { getListingsUrl } from "../lib/urls.js";
import type { InstituteInfo } from "../types/index.js";

export function getInstitutes(): InstituteInfo[] {
  return Object.entries(institutionsData).map(([code, info]) => ({
    code,
    name: info.name,
    campus: info.campus,
    abbr: info.abbr,
  }));
}

export async function fetchInstituteDisciplines(
  code: string,
): Promise<string[]> {
  const $ = await fetchPage(getListingsUrl(code));
  const rows = $("tr[bgcolor='#658CCF'] ~ tr");
  const codes: string[] = [];

  for (const row of rows) {
    const tds = $(row).find("td").toArray();
    if (tds.length < 1) continue;
    const disciplineCode = $(tds[0]).find("span").text().trim();
    if (disciplineCode) {
      codes.push(disciplineCode);
    }
  }

  return codes;
}
