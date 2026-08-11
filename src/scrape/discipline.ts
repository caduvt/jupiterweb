import { fetchPage } from "../lib/fetch.js";
import {
  getDisciplineUrl,
  getOfferingUrl,
  getRequirementsUrl,
} from "../lib/urls.js";
import { parseMainPage } from "../parse/main.js";
import { parseRequirements } from "../parse/requirements.js";
import { parseOfferings } from "../parse/offerings.js";
import type { DisciplineData } from "../types/index.js";

export async function fetchDiscipline(code: string): Promise<DisciplineData> {
  const upperCode = code.toUpperCase();

  const [main$, req$, off$] = await Promise.all([
    fetchPage(getDisciplineUrl(upperCode)),
    fetchPage(getRequirementsUrl(upperCode)),
    fetchPage(getOfferingUrl(upperCode)),
  ]);

  const main = parseMainPage(main$);
  const { requirements, idealPeriod } = parseRequirements(req$);
  const offerings = parseOfferings(off$, upperCode);

  return {
    code: upperCode,
    institute: main.institute,
    department: main.department,
    name: main.name,
    englishName: main.englishName,
    requirements,
    idealPeriod,
    offerings,
    sections: main.sections,
  };
}

export async function hasOfferings(code: string): Promise<boolean> {
  const upperCode = code.toUpperCase();
  const $ = await fetchPage(getOfferingUrl(upperCode));
  const offerings = parseOfferings($, upperCode);
  return offerings.length > 0;
}
