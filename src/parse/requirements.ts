import type { CheerioAPI } from "cheerio";
import type { RequirementsData, Requirement } from "../types/index.js";

export function parseRequirements($: CheerioAPI): RequirementsData {
  const requirements: Record<string, Requirement[][]> = {};
  const idealPeriod: Record<string, number> = {};

  const table = $("form[name='form1'] > table").first();
  if (table.length === 0) {
    return { requirements, idealPeriod };
  }

  const rows = table.find("tr.txt_verdana_8pt_gray");
  let course = "";
  let index = 0;

  for (const row of rows) {
    const tds = $(row).find("td");
    if (tds.length === 0) continue;

    const txt = $(tds[0]).text().trim().replace(/\s+/g, " ");
    if (!txt) continue;

    if (txt.startsWith("Curso")) {
      const sep = txt.replace(/^Curso:/, "").split(" - Per\u00edodo ideal:");
      course = sep[0].trim();
      index = 0;
      requirements[course] = [[]];

      if (sep.length > 1) {
        idealPeriod[course] = parseInt(sep[1], 10);
      }
    } else if (course && txt.toLowerCase() === "ou") {
      index++;
      requirements[course].push([]);
    } else if (course) {
      const code = txt.split("-", 1)[0].trim().toUpperCase();
      const type = $(tds[1]).text().trim() || "requirement";

      requirements[course][index].push({ code, type: type.toLowerCase() });
    }
  }

  return { requirements, idealPeriod };
}
